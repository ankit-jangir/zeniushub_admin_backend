const initializeFirebase = require("../config/firebase.config");

const sendNotification=async(token,heading,body)=>{
    try{
      await initializeFirebase.messaging().send({
        token:token,
        notification:{
          title:heading,
          body:body
        }
      })
    }
    catch(err){
      console.log(err);
    }
  }


module.exports = {sendNotification}