const Sequelize=require("sequelize");

const sequelize=require("../ult/database");

const Orderitem= sequelize.define('orderitem',{
  id:{
    type:Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  qty:{
    type:Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports=Orderitem;