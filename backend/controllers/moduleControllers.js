const db = require('../models')
const { Sections, Parts, Exercises, Modules, ScheduleModules, ModuleItems } = db

const moduleControllers = {
  createModule: async (req, res) => {
    const { section_id, member_id } = req.body

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
    const memberId = req.params.memberId
    const modules = await Modules.findAll({
      where: { member_id: memberId }
    })

    return res.json(modules)
  },
  getModuleBySection: async (req, res) => {
    try {
      const { memberId } = req.query
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
  getModuleByPart: async (req, res) => {
    try {
      const { memberId } = req.body
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
  }
}

module.exports = moduleControllers
