const db = require('../models')
const { Schedules, Modules, ScheduleModules, ModuleItems } = db

const scheduleControllers = {
  createModule: async (req, res) => {
    const { section_id, member_id } = req.body

    try {
      console.log('createModule', member_id)
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

  addExercise: async (req, res) => {
    const { module_id, exercise_id } = req.body
    try {
      console.log('createModuleItem', module_id)
      const newModuleItem = await ModuleItems.create({
        module_id,
        exercise_id
      })

      res.json({ success: true, moduleItem: newModuleItem })
    } catch (error) {
      console.error('Error creating moduleItem:', error)
      res.json({ success: false, error: error.message })
    }
  },
  getModules: async (req, res) => {
    const memberId = req.params.memberId
    // if (!memberId) {
    //   return res.status(403).json({ error: "Access denied" });
    // }
    const modules = await Modules.findAll({
      where: { member_id: memberId }
    })

    return res.json(modules)
  }
}

module.exports = scheduleControllers
