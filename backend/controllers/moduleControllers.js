const db = require('../models')
const { Sections, Parts, Exercises, Modules, ScheduleModules, ModuleItems } = db

//! memberId
const moduleControllers = {
  createModule: async (req, res) => {
    const { section_id } = req.body
    const member_id = req.memberId
    console.log('WWW', section_id)

    try {
      const newModule = await Modules.create({
        section_id,
        member_id
      })

      res.json({ success: true, module: newModule })
    } catch (error) {
      console.error('Error creating module:', error)
      res.json({ success: false, error: error.message })
    }
  },
  getModules: async (req, res) => {
    const memberId = req.memberId
    const modules = await Modules.findAll({
      where: { member_id: memberId }
    })

    return res.json(modules)
  },
  getModuleBySection: async (req, res) => {
    try {
      const memberId = req.memberId
      const sectionId = req.params.sectionId

      const module = await Modules.findAll({
        where: {
          member_id: memberId,
          section_id: sectionId
        }
      })

      if (!module) {
        return res.status(404).json({ message: 'Module not found' })
      }

      res.json(module)
    } catch (error) {
      console.error('Error fetching module:', error)
      res.status(500).json({ error: 'Server error' })
    }
  },
  getModulesBySections: async (req, res) => {
    try {
      const memberId = req.memberId
      const sectionIds = req.query.sectionIds ? req.query.sectionIds.split(',') : []

      const modules = await Modules.findAll({
        where: {
          member_id: memberId,
          section_id: sectionIds
        }
      })

      if (!modules || modules.length === 0) {
        return res.status(404).json({ message: 'Modules not found' })
      }

      res.json(modules)
    } catch (error) {
      console.error('Error fetching modules:', error)
      res.status(500).json({ error: 'Server error' })
    }
  },
  getModuleByPart: async (req, res) => {
    try {
      const memberId = req.memberId
      const partId = req.params.partId

      const part = await Parts.findAll({
        where: {
          id: partId
        }
      })

      if (!part) {
        return res.status(404).json({ message: 'Part not found' })
      }

      const sectionId = part.section_id

      const module = await Modules.findOne({
        where: {
          member_id: memberId,
          section_id: sectionId
        }
      })

      if (!module) {
        return res.status(404).json({ message: 'Module not found' })
      }

      res.json(module)
    } catch (error) {
      console.error('Error fetching module:', error)
      res.status(500).json({ error: 'Server error' })
    }
  },

  addExerciseToModule: async (req, res) => {
    const { exerciseId } = req.body
    const moduleId = req.params.moduleId
    try {
      const newModuleItem = await ModuleItems.create({
        module_id: moduleId,
        exercise_id: exerciseId
      })

      res.json({ success: true, moduleItem: newModuleItem })
    } catch (error) {
      console.error('Error creating moduleItem:', error)
      res.json({ success: false, error: error.message })
    }
  },
  getExerciseInModule: async (req, res) => {
    try {
      const moduleId = req.params.moduleId

      const items = await ModuleItems.findAll({
        where: {
          module_id: moduleId
        },
        include: [
          {
            model: Exercises,
            as: 'exercise',
            attributes: ['name']
          }
        ]
      })
      if (!items) {
        return res.status(404).json({ message: 'Exercise items in module not found' })
      }
      res.json(items)
    } catch (error) {
      console.error('Error fetching items:', error)
      res.status(500).json({ error: 'Server error' })
    }
  },
  updateExerciseInModule: async (req, res) => {
    const { updatedItems, existingItemIds } = req.body
    const { moduleId } = req.params

    try {
      // Fetch the existing items in the module from the database
      const existingItems = await ModuleItems.findAll({
        where: { module_id: moduleId },
        attributes: ['id']
      })

      // Get the IDs of the existing items in the database
      const existingItemIdsInDb = existingItems.map(item => item.id)

      const existingItemIdsAsNumbers = existingItemIds.map(id => parseInt(id, 10))
      const itemsToDelete = existingItemIdsInDb.filter(id => !existingItemIdsAsNumbers.includes(id))

      console.log('existingItemIds from frontend:', existingItemIds)
      console.log('existingItemIdsInDb from database:', existingItemIdsInDb)
      console.log('Items to delete:', itemsToDelete)
      // Handle updates and creations
      for (const item of updatedItems) {
        const { itemId, exerciseId, sets, reps, weight, moduleId } = item

        if (itemId) {
          // Update existing item
          await ModuleItems.update(
            { sets, reps, weight },
            { where: { id: itemId } }
          )
        } else {
          console.log('uuu', itemId)
          // Create new item
          await ModuleItems.create({
            exercise_id: exerciseId,
            sets,
            reps,
            weight,
            module_id: moduleId // New item, so need to include moduleId
          })
        }
      }

      // Handle deletions
      for (const itemId of itemsToDelete) {
        await ModuleItems.destroy({ where: { id: itemId } })
      }

      res.json({ success: true, message: 'Module items updated and deleted successfully' })
    } catch (error) {
      console.error('Error updating module items:', error)
      res.status(500).json({ success: false, message: 'Server error' })
    }
  }

}

module.exports = moduleControllers
