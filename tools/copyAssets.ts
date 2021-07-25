import * as shell from "shelljs";

// Copy the swagger file
shell.cp("-R", "swagger_output.json", "dist/");