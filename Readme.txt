1. node/npm version
  node 6.14+
  npm v12+

2.gulp
  
  npm i gulp-cli -g
  version 2.3

  gulp will be installed through npm install on project folder.
  required gulp version is 4+.

3. gulp tasks
   a. build-local is to build local assets (For Sitecore Backend integration).This step won't update the main layout html file.
   b. gulp defaults are for devop pipeline.
   c. gulp build-client is for UX project local testing.
      
4. To View the html mock run the following command in the command prompt

    a. npm install -g http-server
    b. gulp build-client
    c. http-server client/build/membership
    d. component name with .html extension can be used to access the view, such as http://localhost:8080/login.html or http://localhost:8080/register.html
