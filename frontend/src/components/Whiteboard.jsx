// File: frontend/src/components/Whiteboard.jsx

import React, { useState, useRef, useContext } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import { ThemeContext } from '../context/ThemeContext';
import { Pen, Type, Highlighter, Pencil } from 'lucide-react';

const Whiteboard = () => {
  const { theme } = useContext(ThemeContext);
  const [tool, setTool] = useState('pen');
  const [elements, setElements] = useState([]);
  const [properties, setProperties] = useState({
    stroke: '#000000',
    strokeWidth: 5,
    opacity: 1,
    fontSize: 20,
    fontFamily: 'Arial',
  });
  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newElement = {
      id: `el-${elements.length}`,
      tool,
      points: [pos.x, pos.y],
      ...properties,
    };

    if (tool === 'text') {
      newElement.text = 'Type here';
      newElement.x = pos.x;
      newElement.y = pos.y;
    }
    
    setElements([...elements, newElement]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || tool === 'text') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastElement = elements[elements.length - 1];
    lastElement.points = lastElement.points.concat([point.x, point.y]);

    const newElements = elements.slice();
    newElements[newElements.length - 1] = lastElement;
    setElements(newElements);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handlePropertyChange = (prop, value) => {
    setProperties(prev => ({ ...prev, [prop]: value }));
  };

  const handleTextDblClick = (e, index) => {
    const textNode = e.target;
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
    textarea.style.width = `${textNode.width()}px`;
    textarea.style.height = `${textNode.height()}px`;
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
    textarea.style.transformOrigin = 'left top';
    textarea.style.color = textNode.fill();
    textarea.focus();

    const removeTextarea = () => {
      const newElements = elements.slice();
      newElements[index].text = textarea.value;
      setElements(newElements);
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

  const renderElement = (el, i) => {
    if (el.tool === 'text') {
      return (
        <Text
          key={el.id}
          text={el.text}
          x={el.x}
          y={el.y}
          fontSize={el.fontSize}
          fontFamily={el.fontFamily}
          fill={el.stroke}
          draggable
          onDblClick={(e) => handleTextDblClick(e, i)}
        />
      );
    }

    return (
      <Line
        key={el.id}
        points={el.points}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        opacity={el.tool === 'highlighter' ? 0.5 : el.opacity}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
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

  return (
    <div className={`w-full h-full transition-colors ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-xl flex gap-2 border border-gray-200 dark:border-gray-700">
        <ToolButton name="pen" icon={<Pen size={24} />} />
        <ToolButton name="pencil" icon={<Pencil size={24} />} />
        <ToolButton name="highlighter" icon={<Highlighter size={24} />} />
        <ToolButton name="text" icon={<Type size={24} />} />
      </div>

      {/* Properties Panel */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl flex items-center gap-4 border border-gray-200 dark:border-gray-700">
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
      </div>

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
          {elements.map(renderElement)}
        </Layer>
      </Stage>
    </div>
  );
};

export default Whiteboard;
