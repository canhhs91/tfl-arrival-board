import axios from "axios";
const tflAppKey = process.env.TFL_APP_KEY;

export const apiTflClient = axios.create({
  baseURL: 'https://api.tfl.gov.uk',
  params: {
    app_key: tflAppKey,
  },
});