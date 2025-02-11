const { gql } = require('apollo-server-express');
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');

const typeDefs = gql`
  
  type User {
    _id: ID
    username: String
    email: String
    password: String
    profilePhoto: String
    devConfigSTRIPE: DevConfigSTRIPE
    devConfigZOOM : DevConfigZOOM
    meetings: [Meeting]!
  }

  type DevConfigSTRIPE {
    _id: ID
    stripeKey: String
  }

  type Host {
    _id:ID
    organiserName: String
  }

  type Attendee {
    _id:ID
    attendeeName: String
  }

  scalar Upload

  type File {      
      filename: String!
  }

  type DevConfigZOOM {
    _id: ID
    apiKey: String
    apiSecret: String
    meetingNumber: String
    _name: String
    passcode: String
    emailZoom: String
    role: String
    signature: String
    customerKey: String
    webEndpoint: String
  }

  type Meeting {
    _id: ID
    title: String
    date: String    
    duration: String
    meetingPhoto: String
    description: String    
    createdAt: String
    onLine: Boolean
    ZoomURL: String
    comments: [Comment]!
    location: String!
    organiser: Host
    acceptsDonation: String
    attendees: [Attendee]
  }
  
  type Comment {
    _id: ID
    commentText: String
    commentAuthor: String
    createdAt: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(username: String!): User
    meetings(username: String): [Meeting]
    meeting(meetingId: ID!): Meeting
    me: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    # addMeeting(title: String! , date: String! , time: String! , duration: String! , meetingPhoto: String! , description: String! ,onLine: Boolean! , ZoomURL: String! ,acceptsDonation: Boolean! ): Meeting
    addMeeting(title: String! , description: String! , meetingPhoto: String! , date: String!, duration: String! location: String! , onLine: Boolean , ZoomURL: String) : Meeting
    addComment(meetingId: ID!, commentText: String!): Meeting
    removeMeeting(meetingId: ID!): Meeting
    removeComment(meetingId: ID!, commentId: ID!): Meeting
    uploadImage(file: Upload!): File!
  }
`;

module.exports = typeDefs;
