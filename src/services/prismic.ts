import axios from "axios";

export const prismic_api = axios.create({
  baseURL: process.env.PRISMIC_ENDPOINT,
});
