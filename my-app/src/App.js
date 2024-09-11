import React, { useState } from 'react';
import DiagramComponent from './components/Diagram';
import './App.css';
import { saveAs } from 'file-saver';

function App() {
  const [userInput, setUserInput] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');

  const sendToAssistant = async () => {
    if (!userInput) {
      alert("Please enter a message.");
      return;
    }
    const apiKey = 'key'; // Replace with your OpenAI API key
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    const data = {
      model: "gpt-4",
      messages: [{ role: "user", content: userInput }],
      max_tokens: 150,
      temperature: 0.7,
    };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      const assistantMessage = responseData.choices[0].message.content;
      setAssistantResponse(assistantMessage);
    } catch (error) {
      console.error('Error:', error);
      alert("Failed to get a response from the assistant.");
    }
  };

  const addNewState = () => {
    const diagram = window.myDiagram;
    diagram.startTransaction("add state");
    const newKey = "new_state_" + (diagram.model.nodeDataArray.length + 1);
    const newNodeData = {
      key: newKey,
      agent: "New State",
      fields: [],
      loc: "100 100"
    };
    diagram.model.addNodeData(newNodeData);
    diagram.commitTransaction("add state");
  };

  const saveDiagramJSON = () => {
    const diagram = window.myDiagram;
    const json = diagram.model.toJson();
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    saveAs(blob, "diagram.json");
  };

  return (
    <div className="flex flex-col prose">
      <div className="w-full max-w-screen-xl mx-auto">
        <div id="sample" style={{ position: 'relative' }}>
          <div className="button-container">
            <button className="add-state-button" onClick={addNewState}>Add New State</button>
            <button className="save-json-button" onClick={saveDiagramJSON}>Save JSON</button>
          </div>
          <DiagramComponent />
        </div>
        <div className="input-container">
          <textarea
            className="large-textbox"
            id="userInput"
            placeholder="Enter your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button className="send-button" onClick={sendToAssistant}>Send to Assistant</button>
        </div>
        <div className="result-container" id="assistantResponse">
          {assistantResponse && <p>Assistant: {assistantResponse}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;