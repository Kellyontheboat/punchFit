const db = require('../models')
const { Exercises, Schedules, Modules, ScheduleItems, ModuleItems, Sections } = db

const scheduleControllers = {
  createSchedule: async (req, res) => {
    const memberId = req.memberId
    const { scheduleName, date } = req.body

    try {
      const newSchedule = await Schedules.create({
        schedule_name: scheduleName,
        schedule_date: date,
        member_id: memberId
      })

      res.json({ success: true, schedule_id: newSchedule.id }) // Return the schedule_id
    } catch (error) {
      console.error('Error creating schedule:', error)
      res.json({ success: false, error: error.message })
    }
  },
  addIntoScheduleItems: async (req, res) => {
    const memberId = req.memberId
    const { sectionIds, scheduleId } = req.body
    console.log('kkk', { sectionIds, scheduleId })
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
        exercise_id: item.exercise.id // Get the exercise_id from the associated exercise
      }))

      await ScheduleItems.bulkCreate(scheduleItems)

      res.json({ success: true, scheduleItems })
    } catch (error) {
      console.error('Error adding schedule items:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  },

  getMemberSchedules: async (req, res) => {
    const memberId = req.memberId
    console.log('gggggg', memberId)
    const schedules = await Schedules.findAll({
      where: { member_id: memberId }
    })

    return res.json(schedules)
  },
  getItemsInSchedule: async (req, res) => {
    const { scheduleId } = req.params
    console.log('Received scheduleId:', scheduleId)

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

      res.json({ success: true, items })
    } catch (error) {
      console.error('Error fetching schedule items:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  },
  updateSchedule: async (req, res) => {
    const { updatedItems } = req.body;

    try {
      for (const item of updatedItems) {
        const { scheduleId, exerciseId, sets, reps, weight } = item;

        //use schedule_id and exercise_id to retrieve the scheduleItems
        const scheduleItem = await ScheduleItems.findOne({
          where: {
            schedule_id: scheduleId,
            exercise_id: exerciseId
          }
        });

        if (!scheduleItem) {
          return res.status(404).json({ message: `Schedule item not found for exerciseId: ${exerciseId}` });
        }

        // Update only the fields that were provided in the request
        const updatedFields = {};
        if (sets !== undefined) updatedFields.sets = sets;
        if (reps !== undefined) updatedFields.reps = reps;
        if (weight !== undefined) updatedFields.weight = weight;

        await ScheduleItems.update(updatedFields, {
          where: {
            schedule_id: scheduleId,
            exercise_id: exerciseId
          }
        });
      }

      res.json({ success: true, message: 'Schedule items updated successfully' });
    } catch (error) {
      console.error('Error updating schedule items:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
module.exports = scheduleControllers
