const db = require('../models')
const { Schedules, Modules, ScheduleModules, ModuleItems } = db

const scheduleControllers = {
  createModule: async (req, res) => {
    const { section_id, member_id } = req.body;

    try {
      console.log("createModule", member_id)
      const newModule = await Modules.create({
        section_id: section_id,
        member_id: member_id
      });

      res.json({ success: true, module: newModule });
    } catch (error) {
      console.error('Error creating module:', error);
      res.json({ success: false, error: error.message });
    }
  }
}

module.exports = scheduleControllers