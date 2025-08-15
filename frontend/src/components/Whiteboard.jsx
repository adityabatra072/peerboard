// File: frontend/src/components/Whiteboard.jsx
import React, { useState, useRef, useContext, useEffect } from 'react';
import { Stage, Layer, Line, Text, Circle, Group, Rect } from 'react-konva';
import { ThemeContext } from '../context/ThemeContext';
import { Pen, Type, Highlighter, Pencil, MousePointer, Eraser, Trash2 } from 'lucide-react';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const Whiteboard = ({ boardId, session, setActiveUsers }) => {
  const { theme } = useContext(ThemeContext);
  const [tool, setTool] = useState('select');
  const [elements, setElements] = useState([]);
  const [cursors, setCursors] = useState({});
  const [properties, setProperties] = useState({
    stroke: '#000000',
    strokeWidth: 5,
    opacity: 1,
    fontSize: 20,
    fontFamily: 'Arial',
  });
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const lastCursorUpdate = useRef({});

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    if (boardId && session?.user) {
      newSocket.emit('join-board', { boardId, user: session.user });
    }

    newSocket.on('drawing', (data) => {
      setElements(data);
    });

    newSocket.on('active-users', (users) => {
      setActiveUsers(users);
    });

    newSocket.on('cursor-update', (cursorData) => {
      // Throttle updates to prevent flickering
      const now = Date.now();
      const lastUpdate = lastCursorUpdate.current[cursorData.id] || 0;
      
      if (now - lastUpdate > 50) { // Update every 50ms max
        setCursors(prev => ({ 
          ...prev, 
          [cursorData.id]: cursorData 
        }));
        lastCursorUpdate.current[cursorData.id] = now;
      }
    });

    // Clean up disconnected users
    newSocket.on('user-left', (userId) => {
      setCursors(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    return () => {
      newSocket.disconnect();
      // Clear all cursors on disconnect
      setCursors({});
    };
  }, [boardId, session, setActiveUsers]);

  useEffect(() => {
    // Clean up stale cursors periodically
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const updated = {};
        for (const [id, cursor] of Object.entries(prev)) {
          if (now - cursor.timestamp < 2000) { // 2 seconds since last update
            updated[id] = cursor;
          }
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateElementsAndEmit = (newElements) => {
    setElements(newElements);
    if (socket) {
      socket.emit('drawing', newElements);
    }
  };

  const handleMouseDown = (e) => {
    if (tool === 'select' || e.target !== stageRef.current) {
      return;
    }

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tool,
      points: [pos.x, pos.y],
      ...properties,
    };

    if (tool === 'text') {
      newElement.text = 'Type here';
      newElement.x = pos.x;
      newElement.y = pos.y;
      newElement.isNew = true;
    }

    updateElementsAndEmit([...elements, newElement]);
  };

  const handleMouseMove = (e) => {
    // Emit cursor position
    const pos = e.target.getStage().getPointerPosition();
    if (socket && session?.user) {
      socket.emit('cursor-move', { 
        x: pos.x, 
        y: pos.y, 
        email: session.user.email,
        id: session.user.id,
        timestamp: Date.now()
      });
    }

    // Drawing logic
    if (!isDrawing.current || tool === 'select' || tool === 'text') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastElement = elements[elements.length - 1];

    if (!lastElement || !lastElement.points) return;

    lastElement.points = lastElement.points.concat([point.x, point.y]);

    const newElements = elements.slice();
    newElements[newElements.length - 1] = lastElement;
    updateElementsAndEmit(newElements);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleDragEnd = (e, index) => {
    const newElements = elements.slice();
    newElements[index] = {
      ...newElements[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    updateElementsAndEmit(newElements);
  };

  const handlePropertyChange = (prop, value) => {
    setProperties(prev => ({ ...prev, [prop]: value }));
  };

  const handleClearCanvas = () => {
    updateElementsAndEmit([]);
  };

  const editTextNode = (textNode, index) => {
    textNode.hide();

    const textPosition = textNode.absolutePosition();
    const stageBox = stageRef.current.container().getBoundingClientRect();
   
    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
   
    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width() + 5}px`;
    textarea.style.height = `${textNode.height() + 5}px`;
    textarea.style.fontSize = `${textNode.fontSize()}px`;
    textarea.style.border = '1px solid #ccc';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.color = textNode.fill();
    textarea.focus();

    const removeTextarea = () => {
      const newElements = elements.slice();
      newElements[index].text = textarea.value;
      delete newElements[index].isNew;
      updateElementsAndEmit(newElements);
      textNode.show();
      textarea.remove();
      window.removeEventListener('click', handleOutsideClick);
    }
   
    const handleOutsideClick = (evt) => {
      if (evt.target !== textarea) {
        removeTextarea();
      }
    };
   
    textarea.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' && !evt.shiftKey) {
        evt.preventDefault();
        removeTextarea();
      }
    });

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  useEffect(() => {
    const newTextElement = elements.find(el => el.isNew);
    if (newTextElement) {
      const textNode = stageRef.current.findOne(`#${newTextElement.id}`);
      if (textNode) {
        const index = elements.findIndex(el => el.id === newTextElement.id);
        editTextNode(textNode, index);
      }
    }
  }, [elements]);

  const renderElement = (el, i) => {
    const isSelected = tool === 'select';
   
    if (el.tool === 'text') {
      return (
        <Text
          id={el.id}
          key={el.id}
          text={el.text}
          x={el.x}
          y={el.y}
          fontSize={el.fontSize}
          fontFamily={el.fontFamily}
          fill={el.stroke}
          draggable={isSelected}
          onDblClick={isSelected ? (e) => editTextNode(e.target, i) : undefined}
          onDragEnd={(e) => handleDragEnd(e, i)}
        />
      );
    }

    return (
      <Line
        id={el.id}
        key={el.id}
        points={el.points}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        opacity={el.tool === 'highlighter' ? 0.5 : el.opacity}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
        draggable={isSelected}
        onDragEnd={(e) => handleDragEnd(e, i)}
        globalCompositeOperation={
          el.tool === 'eraser' ? 'destination-out' : 'source-over'
        }
      />
    );
  };

  const ToolButton = ({ name, icon }) => (
    <button
      onClick={() => setTool(name)}
      className={`p-3 rounded-lg transition-colors ${
        tool === name
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-200 dark:hover:bg-blue-900'
      }`}
      title={name.charAt(0).toUpperCase() + name.slice(1)}
    >
      {icon}
    </button>
  );

  const isPropertiesPanelVisible = !['select'].includes(tool);

  // Function to generate a unique color for each user
  const getUserColor = (userId) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', 
      '#1A535C', '#FF9F1C', '#2EC4B6', '#E71D36',
      '#662E9B', '#F86624', '#3A86FF', '#FB5607'
    ];
    const index = Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  return (
    <div className={`w-full h-full transition-colors ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-xl flex gap-2 border border-gray-200 dark:border-gray-700">
        <ToolButton name="select" icon={<MousePointer size={24} />} />
        <ToolButton name="pen" icon={<Pen size={24} />} />
        <ToolButton name="pencil" icon={<Pencil size={24} />} />
        <ToolButton name="highlighter" icon={<Highlighter size={24} />} />
        <ToolButton name="eraser" icon={<Eraser size={24} />} />
        <ToolButton name="text" icon={<Type size={24} />} />
        <div className="border-l border-gray-300 dark:border-gray-600 mx-1"></div>
        <button
          onClick={handleClearCanvas}
          className="p-3 rounded-lg transition-colors bg-red-500 text-white hover:bg-red-600"
          title="Clear Canvas"
        >
          <Trash2 size={24} />
        </button>
      </div>

      {/* Properties Panel */}
      {isPropertiesPanelVisible && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl flex items-center gap-4 border border-gray-200 dark:border-gray-700">
          {tool !== 'eraser' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Color</label>
                <input
                  type="color"
                  value={properties.stroke}
                  onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                />
              </div>
              
              {tool !== 'text' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-300">Width</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={properties.strokeWidth}
                    onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
              )}
   
              {tool === 'text' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-300">Size</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={properties.fontSize}
                      onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-300">Font</label>
                    <select
                      value={properties.fontFamily}
                      onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded p-1 text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Comic Sans MS">Comic Sans</option>
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {tool === 'eraser' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">Eraser Size</label>
              <input
                type="range"
                min="1"
                max="100"
                value={properties.strokeWidth}
                onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {elements.map((el, i) => renderElement(el, i))}
        </Layer>
        
        {/* Cursor layer */}
        <Layer>
          {Object.values(cursors)
            .filter(cursor => cursor.id !== session?.user?.id)
            .map(cursor => {
              const userColor = getUserColor(cursor.id);
              const email = cursor.email || 'Collaborator';
              const displayName = email.split('@')[0];
              
              return (
                <Group key={cursor.id}>
                  <Circle 
                    x={cursor.x} 
                    y={cursor.y} 
                    radius={6} 
                    fill={userColor}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                  <Group
                    x={cursor.x + 15}
                    y={cursor.y - 25}
                  >
                    <Rect
                      width={displayName.length * 8 + 20}
                      height={26}
                      fill={userColor}
                      cornerRadius={5}
                      shadowColor="rgba(0,0,0,0.3)"
                      shadowBlur={5}
                      shadowOffsetY={2}
                      shadowOpacity={0.2}
                    />
                    <Text
                      text={displayName}
                      fontSize={14}
                      fill="white"
                      fontStyle="bold"
                      width={displayName.length * 8 + 20}
                      height={26}
                      align="center"
                      verticalAlign="middle"
                      padding={5}
                    />
                  </Group>
                </Group>
              );
            })}
        </Layer>
      </Stage>
    </div>
  );
};

export default Whiteboard;