import { ReactFlowProvider } from 'reactflow';
import './App.css';
import WorkflowBuilder from './react-flow-cmpts/flow';

function App() {
  return (
    <div>
      <ReactFlowProvider>
        <WorkflowBuilder />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
