# agent_scripting_UI
Includes a React application, and an equivalent HTML file for the conversation authoring UI.

### HTML APP: Step-by-Step Setup:
To run the HTML app, simply download the .html file and run from your local machine.

### REACT APP: Step-by-Step Setup:

1. **install NodeJS[https://nodejs.org/en/download/package-manager] for your computer**
   On mac:
    ```
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
     nvm install 20
     export NVM_DIR="$HOME/.nvm"
     [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
     [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion
     node -v # should print 
     npm -v # should print
    ```
4.  **Initialize the React Project:**
   * Install Create React App.
   ```
   npx create-react-app my-app
   cd my-app
   ```

3. **Install GoJS and FileSaver:**
   ```
   npm install gojs file-saver
   ```

4. **Create Components:**
   * Create a folder named `components` inside the `src` directory.
   * Inside `components`, create a file named `Diagram.js`.
  
5. **Run App:**
   within the my-app folder, run:
   ```
   npm start
   ```


### Reference: Directory Structure:
   ```
   my-app/
   |-- public/
   |-- src/
   |   |-- components/
   |   |   |-- Diagram.js
   |   |-- App.js
   |   |-- index.js
   |-- package.json
   ```


