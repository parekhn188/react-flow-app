import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  addNode,
  MiniMap,
  Controls,
  Background,
} from 'reactflow';

import 'reactflow/dist/style.css';
import '../index.css'

import initalNodes from './Nodes';
import initalEdges from './Edges';
import CustomEdge from './ButtonEdge';

const edgeTypes = {buttonEdge: CustomEdge}
initalEdges[0]['type'] = 'buttonEdge'

// Node ids and edges need to be updated 
let id = 1;
const getId = () => `${id++}`

initalNodes.forEach((node) => {
  node.id = getId()
});

initalEdges[0].source = initalNodes[0].id
initalEdges[0].target = initalNodes[1].id


function BasicChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initalNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initalEdges);
  const [addedNode, setAddedNode] = useState(false);
  const [addedChildNode, setAddedChildNode] = useState(false);
  const [parentNode, setParentNode] = useState(false);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  useEffect(() => {
    if (addedNode) {
      const firstNode = nodes.find(node => node.id === initalEdges[0].target)
      setEdges((edges) => edges.concat({
        ...initalEdges[0]
      }));
      setAddedNode(false);
      setParentNode(null);
    }

    if (addedChildNode) {
      setEdges((edges) => edges.concat({
        id: String(parseInt(Math.random() * 10000000)), 	// random number between 0 and 9,999,999,999,999,999,999,
        source: parentNode.id,
        target: nodes[nodes.length-1].id,
        label: 'tmp_data'
      }));
      setAddedChildNode(false); 	// reset for next node creation.
      setParentNode(null); 	// reset for next node creation.
    }

  }, [nodes]);


  //onEdgeClick that will add a new node underneath that edge's target node
  const onEdgeClick = useCallback(
    (event, edge) => {
      const srcNode = nodes.find((node) => node.id === edge.source);
      setNodes((nodes) => nodes.concat(
        {
          ...initalNodes[0], 
          data: {parentId: edge.target, ...initalNodes[0].data}
        }));
      setAddedNode(true);
      setParentNode(srcNode);
    },
    [nodes]
  );

  const handleNodeClick = (event, data) => {
    const detectSameSrc = nodes.filter((node) => node.data.parentId === data.id);
    setNodes((nodes) => nodes.concat({
      id: getId(),
      type: 'default',
      position: {x: data.position.x + detectSameSrc.length*160, y: data.position.y}

    }));
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        edgeTypes={edgeTypes}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        fitView
        snapToGrid={true}
      >
        <Controls/>
        <MiniMap/>
        <Background/>
      </ReactFlow>
    </div>
  )
}

export default BasicChart
