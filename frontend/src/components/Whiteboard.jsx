import React, { useState, useRef, useContext, useEffect } from 'react';
import { Stage, Layer, Line, Text, Circle, Group, Rect } from 'react-konva';
import { ThemeContext } from '../context/ThemeContext';
import { Pen, Type, Highlighter, Pencil, MousePointer, Eraser, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import { supabase } from '../supabaseClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const Whiteboard = ({ boardId, session, setActiveUsers }) => {
  const { theme } = useContext(ThemeContext);
  const [tool, setTool] = useState('select');
  const [elements, setElements] = useState([]);
  const [properties, setProperties] = useState({
    stroke: '#000000',
    strokeWidth: 5,
    opacity: 1,
    fontSize: 20,
    fontFamily: 'Arial',
  });
  
  const [cursors, setCursors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const lastCursorUpdate = useRef({});
  const elementsRef = useRef(elements);
  
  // Update ref whenever elements change
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Save elements to Supabase
  const saveBoardData = async (elementsToSave = elementsRef.current) => {
    if (!boardId) return;
    
    try {
      const { error } = await supabase
        .from('boards')
        .upsert({ 
          id: boardId,
          user_id: session?.user?.id,
          data: { elements: elementsToSave }
        });

      if (error) {
        console.error('Error saving board data:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in saveBoardData:', error);
      return false;
    }
  };

  // Fetch board data from Supabase
  const fetchBoardData = async () => {
    if (!boardId) return;
    
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('data')
        .eq('id', boardId);
        
      if (error) {
        console.error('Error fetching board data:', error);
        return;
      }

      if (data && data.length > 0 && data[0].data && data[0].data.elements) {
        setElements(data[0].data.elements);
      }
    } catch (error) {
      console.error('Error in fetchBoardData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Force reload board data when tab becomes active
  const reloadBoardData = async () => {
    setIsLoading(true);
    await fetchBoardData();
    
    // Emit to socket to sync with other users
    if (socket) {
      socket.emit('drawing', elementsRef.current);
    }
  };

  useEffect(() => {
    if (!boardId) return;
    
    // Create socket connection
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);
    
    // Fetch initial board data
    fetchBoardData();

    // Join board
    if (session?.user) {
      newSocket.emit('join-board', { boardId, user: session.user });
    }

    // Socket event handlers
    newSocket.on('drawing', (data) => {
      if (isTabActive && JSON.stringify(data) !== JSON.stringify(elementsRef.current)) {
        setElements(data);
      }
    });

    newSocket.on('active-users', (users) => {
      setActiveUsers(users);
    });

    newSocket.on('cursor-update', (cursorData) => {
      // Throttle updates to prevent flickering
      const now = Date.now();
      const lastUpdate = lastCursorUpdate.current[cursorData.id] || 0;
      
      if (now - lastUpdate > 50) {
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

    // Tab visibility detection
    const handleVisibilityChange = () => {
      const isActive = document.visibilityState === 'visible';
      setIsTabActive(isActive);
      
      if (isActive) {
        // Force reload when tab becomes active
        reloadBoardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      newSocket.disconnect();
      setCursors({});
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [boardId, session, setActiveUsers]);

  useEffect(() => {
    // Clean up stale cursors periodically
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const updated = {};
        for (const [id, cursor] of Object.entries(prev)) {
          if (now - cursor.timestamp < 2000) {
            updated[id] = cursor;
          }
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e) => {
    if (tool === 'select' || e.target !== stageRef.current || isLoading || !isTabActive) {
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

    const newElements = [...elements, newElement];
    setElements(newElements);
    
    // Emit and save immediately
    if (socket) socket.emit('drawing', newElements);
    saveBoardData(newElements);
  };

  const handleMouseMove = (e) => {
    // Emit cursor position
    const pos = e.target.getStage().getPointerPosition();
    if (socket && session?.user && isTabActive) {
      socket.emit('cursor-move', { 
        x: pos.x, 
        y: pos.y, 
        email: session.user.email,
        id: session.user.id,
        timestamp: Date.now()
      });
    }

    // Drawing logic
    if (!isDrawing.current || tool === 'select' || tool === 'text' || isLoading || !isTabActive) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastElement = elements[elements.length - 1];

    if (!lastElement || !lastElement.points) return;

    lastElement.points = lastElement.points.concat([point.x, point.y]);

    const newElements = [...elements];
    newElements[newElements.length - 1] = lastElement;
    setElements(newElements);
    
    // Emit continuously for real-time collaboration
    if (socket) socket.emit('drawing', newElements);
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      // Save final state after drawing
      saveBoardData();
    }
  };

  const handleDragEnd = (e, index) => {
    const newElements = [...elements];
    newElements[index] = {
      ...newElements[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setElements(newElements);
    
    // Emit and save immediately
    if (socket) socket.emit('drawing', newElements);
    saveBoardData();
  };

  const handlePropertyChange = (prop, value) => {
    setProperties(prev => ({ ...prev, [prop]: value }));
  };

  // INSTANT CLEAR CANVAS WITH GUARANTEED PERSISTENCE
  const handleClearCanvas = async () => {
    if (!isTabActive) return;
    
    // Create an empty array for the cleared state
    const clearedState = [];
    
    // Optimistic UI update
    setElements(clearedState);
    
    // Immediately emit to all users
    if (socket) socket.emit('drawing', clearedState);
    
    // Force immediate save to database without waiting
    await saveBoardData(clearedState);
    
    console.log("Canvas cleared and persisted instantly");
  };

  const editTextNode = (textNode, index) => {
    if (!isTabActive) return;
    
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
      const newElements = [...elements];
      newElements[index].text = textarea.value;
      delete newElements[index].isNew;
      setElements(newElements);
      
      // Emit and save immediately
      if (socket) socket.emit('drawing', newElements);
      saveBoardData();
      
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
    if (isLoading || !isTabActive) return;
    
    const newTextElement = elements.find(el => el.isNew);
    if (newTextElement) {
      const textNode = stageRef.current.findOne(`#${newTextElement.id}`);
      if (textNode) {
        const index = elements.findIndex(el => el.id === newTextElement.id);
        editTextNode(textNode, index);
      }
    }
  }, [elements, isLoading, isTabActive]);

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

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
        <div className="text-xl">Loading board...</div>
      </div>
    );
  }

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
          disabled={!isTabActive}
          className={`p-3 rounded-lg transition-colors ${
            !isTabActive 
              ? 'opacity-50 cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title={!isTabActive ? "Cannot clear while tab is inactive" : "Clear Canvas"}
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