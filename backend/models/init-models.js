const DataTypes = require('sequelize').DataTypes
const _Exercises = require('./Exercises')
const _Images = require('./Images')
const _Instructions = require('./Instructions')
const _Parts = require('./Parts')
const _Secondaryparts = require('./Secondaryparts')
const _Sections = require('./Sections')
const _Schedules = require('./Schedules')
const _ScheduleItems = require('./ScheduleItems')
const _Modules = require('./Modules')
const _ModuleItems = require('./ModuleItems')

function initModels (sequelize) {
  const Exercises = _Exercises(sequelize, DataTypes)
  const Images = _Images(sequelize, DataTypes)
  const Instructions = _Instructions(sequelize, DataTypes)
  const Parts = _Parts(sequelize, DataTypes)
  const Secondaryparts = _Secondaryparts(sequelize, DataTypes)
  const Sections = _Sections(sequelize, DataTypes)
  const Schedules = _Schedules(sequelize, DataTypes)
  const ScheduleItems = _ScheduleItems(sequelize, DataTypes)
  const Modules = _Modules(sequelize, DataTypes)
  const ModuleItems = _ModuleItems(sequelize, DataTypes)

  Images.belongsTo(Exercises, { as: 'exercise', foreignKey: 'exercises_id' })
  Exercises.hasMany(Images, { as: 'Images', foreignKey: 'exercises_id' })
  Instructions.belongsTo(Exercises, { as: 'exercise', foreignKey: 'exercises_id' })
  Exercises.hasMany(Instructions, { as: 'Instructions', foreignKey: 'exercises_id' })
  Secondaryparts.belongsTo(Exercises, { as: 'exercise', foreignKey: 'exercise_id' })
  Exercises.hasMany(Secondaryparts, { as: 'Secondaryparts', foreignKey: 'exercise_id' })
  Exercises.belongsTo(Parts, { as: 'part', foreignKey: 'parts_id' })
  Parts.hasMany(Exercises, { as: 'Exercises', foreignKey: 'parts_id' })
  Exercises.hasMany(ScheduleItems, { foreignKey: 'exercise_id', as: 'scheduleItems' })
  ScheduleItems.belongsTo(Exercises, { foreignKey: 'exercise_id', as: 'exercise' })
  ModuleItems.belongsTo(Exercises, { foreignKey: 'exercise_id', as: 'exercise' })
  Exercises.hasMany(ModuleItems, { foreignKey: 'exercise_id', as: 'moduleItems' })

  return {
    Exercises,
    Images,
    Instructions,
    Parts,
    Secondaryparts,
    Sections,
    ScheduleItems
  }
}
module.exports = initModels
module.exports.initModels = initModels
module.exports.default = initModels
