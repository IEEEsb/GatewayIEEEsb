module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('services', {
			path: { type: Sequelize.DataTypes.STRING, primaryKey: true, allowNull: false },
			name: { type: Sequelize.DataTypes.STRING, allowNull: false },
			roles: { type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING), defaultValue: [] },
			url: { type: Sequelize.DataTypes.STRING, allowNull: false },
			secret: { type: Sequelize.DataTypes.STRING, allowNull: false },
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE,
			},
		});
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('services');
	},
};
