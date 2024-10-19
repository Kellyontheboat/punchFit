const db = require('../models')
const { Exercises, Schedules, Modules, ScheduleItems, ModuleItems, Sections, Members } = db
const { redisClient } = require('../services/redisService')

const crypto = require('crypto')
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const sanitizeHtml = require('sanitize-html')

const { multipartUpload } = require('../services/s3.js')

const scheduleControllers = {
  createSchedule: async (req, res) => {
    const memberId = req.memberId
    const { scheduleName, date, captionInput } = req.body
    const file = req.file // from middleware/upload.js

    if (!scheduleName || !date) {
      return res.status(400).json({ error: 'Schedule name and date are required.' })
    }

    if (scheduleName.length > 10) {
      return res.status(400).json({ error: 'Schedule name should not exceed 10 characters.' })
    }

    if (captionInput && captionInput.length > 500) {
      return res.status(400).json({ error: 'Caption should not exceed 500 characters.' })
    }

    let videoName = null
    if (file) {
      videoName = generateFileName()
      try {
        // Call multipartUpload instead of uploadFile for large file uploads
        await multipartUpload(videoName, file.buffer, file.mimetype)
      } catch (error) {
        return res.status(500).json({ error: `${error.message}. Failed to upload video` })
      }
    }

    try {
      // Sanitize the caption input
      const sanitizedCaption = sanitizeHtml(captionInput, {
        allowedTags: [], // Disallow all HTML tags
        allowedAttributes: {}
      })

      // Sanitize the schedule name input
      const sanitizedScheduleName = sanitizeHtml(scheduleName, {
        allowedTags: [], // Disallow all HTML tags
        allowedAttributes: {}
      })

      const newSchedule = await Schedules.create({
        schedule_name: sanitizedScheduleName,
        schedule_date: date,
        member_id: memberId,
        video: videoName,
        content: sanitizedCaption
      })

      res.json({ success: true, schedule_id: newSchedule.id }) // Return the schedule_id
    } catch (error) {
      res.json({ success: false, error: `${error.message}. Failed to create schedule` })
    }
  },
  addIntoScheduleItems: async (req, res) => {
    const memberId = req.memberId
    const { sectionIds, scheduleId } = req.body
    try {
      // 1. Find all modules for the given member and sectionIds
      const modules = await Modules.findAll({
        where: {
          member_id: memberId,
          section_id: sectionIds
        }
      })

      // 2. Extract moduleIds and map them by their section_id
      const moduleIdSectionMap = modules.reduce((acc, module) => {
        acc[module.id] = module.section_id
        return acc
      }, {})

      const moduleIds = Object.keys(moduleIdSectionMap)

      // 3. Find all module items (exercises) for the retrieved moduleIds
      const moduleItems = await ModuleItems.findAll({
        where: {
          module_id: moduleIds
        },
        include: [
          {
            model: Exercises,
            as: 'exercise',
            attributes: ['id']
          }
        ]
      })

      // 4. Create entries in ScheduleItems for each module item
      const scheduleItems = moduleItems.map(item => ({
        schedule_id: scheduleId,
        section_id: moduleIdSectionMap[item.module_id], // Get section_id from the moduleIdSectionMap
        exercise_id: item.exercise.id, // Get the exercise_id from the associated exercise
        reps: item.reps,
        sets: item.sets,
        weight: item.weight
      }))

      await ScheduleItems.bulkCreate(scheduleItems)

      res.json({ success: true, scheduleItems })
    } catch (error) {
      res.status(500).json({ success: false, error: `${error.message}. Failed to add into schedule items` })
    }
  },
  // Get all schedules for a member by memberId
  getMemberSchedules: async (req, res) => {
    const memberId = req.memberId
    const schedules = await Schedules.findAll({
      where: { member_id: memberId },
      order: [
        ['schedule_date', 'DESC'],
        ['created_at', 'DESC']
      ],
      raw: true
    })
    const schedulesWithVideoUrl = await Promise.all(schedules.map(async (schedule) => {
      schedule.videoUrl = 'https://d348uiae81km7c.cloudfront.net/' + schedule.video
      return schedule
    }))
    return res.json(schedulesWithVideoUrl)
  },
  // get items in schedule for coach notification / student posts
  getItemsInSchedule: async (req, res) => {
    const { scheduleId } = req.params
    const studentId = req.memberId

    try {
      // Fetch the items associated with the given schedule_id
      const items = await ScheduleItems.findAll({
        where: {
          schedule_id: scheduleId
        },
        include: [
          {
            model: Exercises,
            as: 'exercise',
            attributes: ['id', 'name'] // Include the exercise details
          },
          {
            model: Sections,
            as: 'section',
            attributes: ['id', 'section_name'] // Include the section details
          }
        ]
      })

      // Determine if the student is in the consultation procedure
      const isConsulting = req.query.consulting === 'true'

      if (isConsulting) {
        const student = await Members.findByPk(studentId)
        if (!student) {
          return res.status(404).json({ error: 'Student not found' })
        }
        const TTL = 864000 // 24 hours in seconds*10
        await redisClient.set(`postItems:${scheduleId}`, JSON.stringify(items), {
          EX: TTL
        })
        return res.json({ success: true, items })
      }

      return res.json({ success: true, items })
    } catch (error) {
      res.status(500).json({ success: false, error: `${error.message}. Failed to get items in schedule` })
    }
  },
  // Get data for coach by scheduleId
  getScheduleById: async (req, res) => {
    const scheduleId = req.params.scheduleId
    const studentId = req.memberId

    try {
      const schedule = await Schedules.findByPk(scheduleId)

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' })
      }

      const scheduleName = schedule.schedule_name
      const scheduleContent = schedule.content
      const scheduleWithVideoUrl = 'https://d348uiae81km7c.cloudfront.net/' + schedule.video

      const isConsulting = req.query.consulting === 'true'
      if (isConsulting) {
        const student = await Members.findByPk(studentId)

        if (!student) {
          return res.status(404).json({ error: 'Student not found' })
        }
      }
      const postContent = { scheduleWithVideoUrl, scheduleName, scheduleContent }
      const TTL = 864000 // 24 hours in seconds*10
      await redisClient.set(`postContent:${scheduleId}`, JSON.stringify(postContent), {
        EX: TTL
      })

      return res.json(postContent)
    } catch (error) {
      return res.status(500).json({ error: `${error.message}. Failed to get schedule by id` })
    }
  },
  updateSchedule: async (req, res) => {
    const { updatedItems, itemsToDelete } = req.body

    try {
      // Handle updates
      for (const item of updatedItems) {
        const { scheduleId, exerciseId, sets, reps, weight } = item

        const scheduleItem = await ScheduleItems.findOne({
          where: {
            schedule_id: scheduleId,
            exercise_id: exerciseId
          }
        })

        if (!scheduleItem) {
          return res.status(404).json({ message: `Schedule item not found for exerciseId: ${exerciseId}` })
        }

        const updatedFields = {}
        if (sets !== undefined) updatedFields.sets = sets
        if (reps !== undefined) updatedFields.reps = reps
        if (weight !== undefined) updatedFields.weight = weight

        await ScheduleItems.update(updatedFields, {
          where: {
            schedule_id: scheduleId,
            exercise_id: exerciseId
          }
        })
      }

      // Handle deletions
      for (const exerciseId of itemsToDelete) {
        await ScheduleItems.destroy({
          where: {
            schedule_id: updatedItems[0].scheduleId, // Use the scheduleId from the first item
            exercise_id: exerciseId
          }
        })
      }

      res.json({ success: true, message: 'Schedule items updated and deleted successfully' })
    } catch (error) {
      res.status(500).json({ success: false, error: `${error.message}. Failed to update schedule items` })
    }
  },
  deleteSchedule: async (req, res) => {
    const scheduleId = req.params.scheduleId

    try {
      const deletedRows = await Schedules.destroy({
        where: {
          id: scheduleId
        }
      })

      if (deletedRows === 0) {
        return res.status(404).json({ success: false, message: 'Schedule not found' })
      }

      return res.status(200).json({ success: true, message: 'Schedule deleted successfully' })
    } catch (error) {
      return res.status(500).json({ success: false, error: `${error.message}. Failed to delete schedule` })
    }
  }
}
module.exports = scheduleControllers
