const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
      title: 'FlatMatch',
      description: 'The backend server of FlatMatch',
    },
    host: 'localhost:8080',
    schemes: ['http'],
  };

const outputFile = './swagger_output.json'
const endpointsFiles = ['./src/server.ts']

swaggerAutogen(outputFile, endpointsFiles, doc)