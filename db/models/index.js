const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('..');

class Service extends Model {}

Service.init({
	path: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
	name: { type: DataTypes.STRING, allowNull: false },
	roles: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
	url: { type: DataTypes.STRING, allowNull: false },
	secret: { type: DataTypes.STRING, allowNull: false },
}, {
	sequelize,
	modelName: 'Service',
	tableName: 'services',
});

module.exports = {
	Service,
};
