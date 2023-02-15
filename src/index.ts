import { EnvVar, getEnvVarOrFail } from "./utils";
import axios from "axios";
import dotenv from "dotenv";
import { getJiraIdFromBranchName } from "./github";

// Load environment variables from `.env`
dotenv.config({});
