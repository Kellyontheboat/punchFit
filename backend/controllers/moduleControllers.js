const { redisClient } = require('../services/redisService')

const db = require('../models')
const { Exercises, Modules, ModuleItems } = db

//! memberId
const moduleControllers = {
  createModule: async (req, res) => {
    const { section_id } = req.body
    const member_id = req.memberId

    try {
      // Create a new module
      const newModule = await Modules.create({
        section_id,
        member_id
      })

      // Retrieve from Redis
      const cacheKey = `modules:${member_id}:${section_id}`
      let moduleArray = await redisClient.get(cacheKey)

      // Parse existing data or initialize a new array if not present
      // Keep the format as array to let renderItem(forEach) to work
      moduleArray = moduleArray ? JSON.parse(moduleArray) : []

      moduleArray.push(newModule)

      await redisClient.set(cacheKey, JSON.stringify(moduleArray))

      res.json({ success: true, module: newModule })
    } catch (error) {
      res.json({
        success: false,
        error: `${error.message}. Failed to create module`
      })
    }
  },
  getModuleBySection: async (req, res) => {
    try {
      const memberId = req.memberId
      const sectionId = req.params.sectionId

      const cacheKey = `modules:${memberId}:${sectionId}`
      const cachedModule = await redisClient.get(cacheKey)
      if (cachedModule) {
        return res.json(JSON.parse(cachedModule))
      }

      const module = await Modules.findAll({
        where: { member_id: memberId, section_id: sectionId }
      })

      if (!module) {
        return res.status(404).json({ message: 'Module not found' })
      }
      await redisClient.set(cacheKey, JSON.stringify(module))
      res.json(module)
    } catch (error) {
      res.status(500).json({
        error: `${error.message}. Failed to get module by section`
      })
    }
  },
  getModulesBySections: async (req, res) => {
    try {
      const memberId = req.memberId
      const sectionIds = req.query.sectionIds.split(',')

      const modules = []

      for (const sectionId of sectionIds) {
        const cacheKey = `modules:${memberId}:${sectionId}`
        const cachedModuleArray = await redisClient.get(cacheKey)

        if (cachedModuleArray) {
          // Parse the JSON string from Redis
          const parsedModules = JSON.parse(cachedModuleArray)
          modules.push(...parsedModules)
        } else {
          // Fetch data with raw: true
          const moduleData = await Modules.findAll({
            where: { member_id: memberId, section_id: sectionId },
            raw: true // return raw data
          })

          if (moduleData) {
            // Save the fetched data to Redis
            await redisClient.set(cacheKey, JSON.stringify(moduleData))
            modules.push(...moduleData)
          }
        }
      }
      res.json(modules)
    } catch (error) {
      res.status(500).json({
        error: `${error.message}. Failed to get modules by sections`
      })
    }
  },
  getExerciseInModule: async (req, res) => {
    try {
      const moduleId = req.params.moduleId

      // Check Redis first
      const cachedItems = await redisClient.get(`moduleItems:${moduleId}`)
      if (cachedItems) {
        return res.json(JSON.parse(cachedItems))
      }

      const items = await ModuleItems.findAll({
        where: { module_id: moduleId },
        include: [{ model: Exercises, as: 'exercise', attributes: ['name'] }]
      })

      if (!items) {
        return res.status(404).json({ message: 'Exercise items in module not found' })
      }

      await redisClient.set(`moduleItems:${moduleId}`, JSON.stringify(items))
      res.json(items)
    } catch (error) {
      res.status(500).json({
        error: `${error.message}. Failed to get exercise in module`
      })
    }
  },
  updateExerciseInModule: async (req, res) => {
    const { updatedItems, existingItemIds } = req.body
    const { moduleId } = req.params

    try {
      // Fetch from Redis
      const cachedItems = await redisClient.get(`moduleItems:${moduleId}`)
      let existingItems = []
      if (cachedItems) {
        existingItems = JSON.parse(cachedItems)
      } else {
        // If not in cache, fetch from the database
        existingItems = await ModuleItems.findAll({
          where: { module_id: moduleId },
          attributes: ['id']
        })
        // Cache the existing items
        await redisClient.set(`moduleItems:${moduleId}`, JSON.stringify(existingItems))
      }

      // Get the IDs of the existing items in the database
      const existingItemIdsInDb = existingItems.map(item => item.id)
      const existingItemIdsAsNumbers = existingItemIds.map(id => parseInt(id, 10))
      const itemsToDelete = existingItemIdsInDb.filter(id => !existingItemIdsAsNumbers.includes(id))

      // Handle updates and creations
      for (const item of updatedItems) {
        const { itemId, exerciseId, sets, reps, weight } = item

        if (itemId) {
          // Update existing item
          await ModuleItems.update(
            { sets, reps, weight },
            { where: { id: itemId } }
          )
        } else {
          // Create new item
          await ModuleItems.create({
            exercise_id: exerciseId,
            sets,
            reps,
            weight,
            module_id: moduleId
          })
        }
      }

      // Handle deletions
      for (const itemId of itemsToDelete) {
        await ModuleItems.destroy({ where: { id: itemId } })
      }

      // Sync Redis cache
      await redisClient.del(`moduleItems:${moduleId}`)

      // cache the updated items
      const updatedItemsCache = await ModuleItems.findAll({
        where: { module_id: moduleId },
        include: [{ model: Exercises, as: 'exercise', attributes: ['name'] }]
      })
      await redisClient.set(`moduleItems:${moduleId}`, JSON.stringify(updatedItemsCache))

      res.json({ success: true, message: 'Module items updated and deleted successfully' })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `${error.message}. Failed to update exercise in module`
      })
    }
  }
}
module.exports = moduleControllers
