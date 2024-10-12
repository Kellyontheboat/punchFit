const db = require('../models');
const { Messages } = db;
const { redisClient } = require('./redisService')


async function createMessage({ roomId, senderId, messageText }) {
  try {
    const message = await Messages.create({
      roomNumber: roomId,
      sender_id: senderId,
      message_text: messageText,
      read: 0
    });

    return message;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

// Function to get rooms for a user(get the schedule with conversations has msg not been read yet)
async function getSchedulesForUser(userId, isCoach) {
  try {
    const keys = await redisClient.keys('messages:*');
    console.log("Found keys:", keys);
    const schedules = [];
    const unreadRoomIds = [];
    for (const key of keys) {
      const roomId = key.split(':')[1];
      const [studentId, coachId, scheduleId] = roomId.split('_');
      console.log(`Checking room: ${roomId}, userId: ${userId}, isCoach: ${isCoach}`);

      if ((isCoach && coachId === userId.toString()) || (!isCoach && studentId === userId.toString())) {
        console.log(`User ${userId} is part of room ${roomId}`);
        // Fetch the messages to check if there are unread messages
        const messagesString = await redisClient.get(key);
        const messages = messagesString ? JSON.parse(messagesString) : [];
        console.log(`Messages for room ${roomId}:`, messages);

        // check if there are unread messages
        const hasUnreadMessages = messages.some(msg => {
          const isUnread = msg.read === 0;
          const isFromOtherUser = isCoach ? // if is coach, the message is from student
            msg.sender_id.toString() !== userId.toString() : 
            msg.sender_id.toString() === coachId;
          console.log(`Message: ${msg.message_text}, isUnread: ${isUnread}, isFromOtherUser: ${isFromOtherUser}, sender_id: ${msg.sender_id}, userId: ${userId}`);
          return isUnread && isFromOtherUser;
        });

        console.log(`Room ${roomId} has unread messages: ${hasUnreadMessages}`);

          schedules.push({
            id: scheduleId,
            studentId,
            coachId,
            roomId
          });
        
        if (hasUnreadMessages) {
          unreadRoomIds.push(roomId);
        }

      } else {
        console.log(`User ${userId} is not part of room ${roomId}`);
      }
    }

    console.log("Schedules with unread messages:", schedules, unreadRoomIds);
    return {schedules, unreadRoomIds};
  } catch (error) {
    console.error('Error retrieving schedules for user:', error);
    throw error;
  }
}

async function getMessagesForRoom(roomId) {
  const messagesString = await redisClient.get(`messages:${roomId}`);
  const studentId = roomId.split('_')[0];
  const coachId = roomId.split('_')[1];
  const notificationKey = `notification_coachId:${coachId}`;
  let studentName = '';

  try {
    // Get all members of the set
    const memberSet = await redisClient.sMembers(notificationKey);
    
    if (memberSet && memberSet.length > 0) {
      // Parse each member and find the matching student
      const memberData = memberSet
        .map(member => JSON.parse(member))
        .find(member => member.studentId === parseInt(studentId));
      
      if (memberData) {
        studentName = memberData.studentName;
      }
    }
  } catch (error) {
    console.error('Error retrieving notification data:', error);
  }
  console.log(`Student name: ${studentName}`);
  console.log(`Messages string: ${messagesString}`);
  return {
    messages: messagesString ? JSON.parse(messagesString) : [],
    studentName: studentName
  };
}

async function saveMessageToRoom(message) {

  // Save into DB
  await createMessage({
    roomId: message.roomId,
    senderId: message.user.id,
    messageText: message.text
  });

  // Push the message to Redis
  const key = `messages:${message.roomId}`;
  const newMessage = {
    sender_id: message.user.id,
    message_text: message.text,
    timestamp: new Date(),
    read: 0
  };

  // Get existing messages
  const messagesString = await redisClient.get(key);
  const messages = messagesString ? JSON.parse(messagesString) : [];
  messages.push(newMessage);
  // Set the messages in Redis with a TTL
  const TTL = 864000; // 24 hours*10 in seconds
  await redisClient.set(key, JSON.stringify(messages), { EX: TTL });  
  return newMessage;
}
async function getPostContent (scheduleId) {
  const postContent = await redisClient.get(`postContent:${scheduleId}`);
  return postContent;
}

async function getPostItems (scheduleId) {
  const postItems = await redisClient.get(`postItems:${scheduleId}`);
  return postItems;
}
module.exports = {
  createMessage,
  getSchedulesForUser,
  getMessagesForRoom,
  saveMessageToRoom,
  getPostContent,
  getPostItems
};