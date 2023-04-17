import React, {useCallback, useEffect, useState} from 'react';
import {v4 as uuid} from 'uuid';

import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';

import initalNodes from './Nodes';
import CustomEdge from './ButtonEdge';

// Dagre graph setup
import dagre from 'dagre';
const dagreGraph = new dagre.graphlib.Graph();
const nodeWidth = 150;
const nodeHeight = 50;

dagreGraph.setDefaultEdgeLabel(() => ({}));

const edgeTypes = {buttonEdge: CustomEdge};


const dagrify = (nodes, edges, dir) => {
  const isHorizontal = dir === 'LR';

  // 'Dagrify' the nodes and edges
  dagreGraph.setGraph({ rankdir: dir });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Set the node positions according to the dagre layout
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // shift dagre node position 
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });
  return {nodes, edges};
}

function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initalNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layout, setLayout] = useState(' ');
  
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const handleButtonClick = useCallback((dir) => {
    setLayout(dir)
    const { nodes: newNodes, edges:newEdges } = dagrify(nodes, edges, dir); 
    setNodes([...newNodes]);
    setEdges([...newEdges]);
  }, [nodes, edges]);
  

  // Fit view animation setup 
  const rfInstance = useReactFlow();
  const fitViewOptions = { padding: 0.1, duration: 800}


  useEffect(() => {
    rfInstance.fitView(fitViewOptions);

    console.log(layout)

    dagrify(nodes, edges, layout);
  }, [nodes, edges]);

  

  const HandleEdgeClick = (event, edge) => {
    const srcNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
  
    // Take over the target node position and move the prev target node down
    const newNode = {
      id: uuid(),
      data: { label: String(Math.floor(Math.random() * 1000)),
              parentId: srcNode.id},
      position: { x: targetNode.position.x, y: targetNode.position.y},
    };

    // Update target node parent
    targetNode.data.parentId = newNode.id;

    // all nodes starting with the target node and underneath need to be shifted down
    // const nodesToShift = nodes.filter((node) => node.position.x === targetNode.position.x && node.position.y >= targetNode.position.y);
    // nodesToShift.forEach((node) => {
    //   node.position.y += 110;
    // });
    
    // Create new edges
    const newEdges = [
      {
        id: uuid(),
        source: srcNode.id,
        target: newNode.id,
        type: 'buttonEdge'
      },
      {
        id: uuid(),
        source: newNode.id,
        target: targetNode.id,
        type: 'buttonEdge'
      }
    ];

    const updatedEdges = edges.filter((e) => e.id !== edge.id).concat(newEdges);
  
    // Update the nodes and edges
    setNodes([...nodes, newNode]);
    setEdges(updatedEdges);
  };

  const HandleNodeClick = (event, node) => {
    const childNodes = nodes.filter(nodes => nodes.data.parentId === node.id);

    //Conditions for adding a new node w/w out children are different 
    if (nodes.length === 1 || childNodes.length === 0) {
      const newNode = {
        id: uuid(),
        data: { label: String(Math.floor(Math.random() * 1000)) ,
                parentId: node.id},
        position: {x: node.position.x, y: node.position.y+100}
      }
      
      const newEdge = {
        id: uuid(),
        source: node.id,
        target: newNode.id,
        type: 'buttonEdge',
        animated: true
      }

      setNodes([...nodes, newNode]);
      setEdges([...edges, newEdge]);
      return;
    }

    const lastChild = childNodes[childNodes.length-1]

    const newPos = {
      x: lastChild.position.x + 100, 
      y: lastChild.position.y
    }
    
    const newNode = {
      id: uuid(),
      data: { label: String(Math.floor(Math.random() * 1000)),
              parentId: node.id},
      position: {x: newPos.x, y: newPos.y}, 
    }
    
    const newEdge = {
      id: uuid(),
      source: node.id,
      target: newNode.id,
      type: 'buttonEdge'
    }
    
    setNodes([...nodes, newNode]);
    setEdges([...edges, newEdge]);
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className='controls'>
        <button onClick={() => handleButtonClick('TB')}>Top Bottom</button>
        <button onClick={() => handleButtonClick('LR')}>Left Right</button>
      </div>
      <ReactFlow
        fitView={true}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        edgeTypes={edgeTypes}
        onEdgeClick={HandleEdgeClick}
        onNodeClick={HandleNodeClick}
        onConnect={onConnect}
        snapToGrid={true}
      >
        <Controls/>
        <MiniMap/>
        <Background/>
      </ReactFlow>
    </div>
  )
}

export default WorkflowBuilder

