"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:*/
    return queryInterface.bulkInsert(
      "users",
      [
        {
          fullName: "Admin",
          role: "admin",
          gender: "Male",
          email: "admin@gmail.com",
          password:
            "$$2a$12$mq4xqbNO1L3n730FyXnLKOnkbpdOnQmfdeF2P/tbTqHmskcTfyne6",
          address: "unknown",
          phone: "082254654721",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:*/
    return queryInterface.bulkDelete("users", null, {});
  },
};
