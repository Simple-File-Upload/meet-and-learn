const { AuthenticationError } = require('apollo-server-express');
const { User, Meeting } = require('../models');
const { signToken } = require('../utils/auth');
const path = require("path");
const fs = require("fs");

const {
  GraphQLUpload,
  graphqlUploadExpress // A Koa implementation is also exported.
} = require("graphql-upload");

const resolvers = {
  
  Upload: GraphQLUpload,

  Query: {
    users: async () => {
      return User.find().populate('meetings');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('meetings');
    },
    meetings: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Meeting.find(params).sort({ createdAt: -1 });
    },
    meeting: async (parent, { meetingId }) => {
      return Meeting.findOne({ _id: meetingId });
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('meetings');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    addMeeting: async (parent, 
      { title, 
        meetingPhoto , 
        description , 
        date,
        duration,        
        onLine ,  
        ZoomURL , 
        location ,
        attendees,
        organiser ,
        acceptsDonation
      }, context) => {
      if (context.user) {
        const meeting = await Meeting.create({
          title, 
          meetingPhoto , 
          description ,
          date,
          duration,           
          onLine,  
          ZoomURL , 
          location ,
          attendees : [{_id: context.user._id , attendeeName: context.user.username}],
          organiser : {_id: context.user._id, organiserName: context.user.username},
          acceptsDonation          
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { meetings: meeting._id } }
        );

        return meeting;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    addComment: async (parent, { meetingId, commentText }, context) => {
      if (context.user) {
        return Meeting.findOneAndUpdate(
          { _id: meetingId },
          {
            $addToSet: {
              comments: { commentText, commentAuthor: context.user.username },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeMeeting: async (parent, { meetingId }, context) => {
      if (context.user) {
        const meeting = await Meeting.findOneAndDelete({
          _id: meetingId,
          meetingAuthor: context.user.username,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { meetings: meeting._id } }
        );

        return meeting;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeComment: async (parent, { meetingId, commentId }, context) => {
      if (context.user) {
        return Meeting.findOneAndUpdate(
          { _id: meetingId },
          {
            $pull: {
              comments: {
                _id: commentId,
                commentAuthor: context.user.username,
              },
            },
          },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    uploadImage: async (_, { file }) => {
      const { createReadStream, filename } = await file;       
      const uploadedName = `${Date.now()}_${filename}` ;            
      const stream = createReadStream(); 
      const pathName = path.join(__dirname, "..", `public/uploads/${uploadedName}`);
      await stream.pipe(fs.createWriteStream(pathName));      
      return { 
        filename: uploadedName        
      };
    },
  },
  
};

module.exports = resolvers;
