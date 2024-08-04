const DataTypes = require('sequelize').DataTypes
const _Exercises = require('./Exercises')
const _Images = require('./Images')
const _Instructions = require('./Instructions')
const _Parts = require('./Parts')
const _Secondaryparts = require('./Secondaryparts')
const _Sections = require('./Sections')

function initModels (sequelize) {
  const Exercises = _Exercises(sequelize, DataTypes)
  const Images = _Images(sequelize, DataTypes)
  const Instructions = _Instructions(sequelize, DataTypes)
  const Parts = _Parts(sequelize, DataTypes)
  const Secondaryparts = _Secondaryparts(sequelize, DataTypes)
  const Sections = _Sections(sequelize, DataTypes)

  Images.belongsTo(Exercises, { as: 'exercise', foreignKey: 'exercises_id' })
  Exercises.hasMany(Images, { as: 'Images', foreignKey: 'exercises_id' })
  Instructions.belongsTo(Exercises, { as: 'exercise', foreignKey: 'exercises_id' })
  Exercises.hasMany(Instructions, { as: 'Instructions', foreignKey: 'exercises_id' })
  Secondaryparts.belongsTo(Exercises, { as: 'exercise', foreignKey: 'exercise_id' })
  Exercises.hasMany(Secondaryparts, { as: 'Secondaryparts', foreignKey: 'exercise_id' })
  Exercises.belongsTo(Parts, { as: 'part', foreignKey: 'parts_id' })
  Parts.hasMany(Exercises, { as: 'Exercises', foreignKey: 'parts_id' })

  return {
    Exercises,
    Images,
    Instructions,
    Parts,
    Secondaryparts,
    Sections
  }
}
module.exports = initModels
module.exports.initModels = initModels
module.exports.default = initModels
