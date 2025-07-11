import React, { useState, useEffect, useRef } from 'react';
import './BobaCupDisplay.css';

const BobaCupCharacter = ({ children, customerCount = 0 }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  // Auto blink every 3-5 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 2000 + 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Random wave animation
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1000);
    }, 8000);

    return () => clearInterval(waveInterval);
  }, []);

  return (
    <div className="boba-cup-wrapper">
      <div className="boba-cup-container">
        {/* Customer Count Display */}
        <div className="customer-count-display">
          {customerCount} Customer{customerCount !== 1 ? 's' : ''}
        </div>

        {/* Straw */}
        <div className="straw"></div>
        
        {/* Lid */}
        <div className="lid"></div>

        {/* Cup Body */}
        <div className="cup-body">
          {/* Milk Tea */}
          <div className="milk-tea">
            {/* Face */}
            <div className="face-container">
              <div className={`eye left ${isBlinking ? 'blinking' : ''}`}></div>
              <div className={`eye right ${isBlinking ? 'blinking' : ''}`}></div>
              <div className="mouth"></div>
              <div className="blush left"></div>
              <div className="blush right"></div>
            </div>

            {/* Customer Pearls Container */}
            <div className="customer-pearls-container">
              {children}
            </div>
          </div>
        </div>

        {/* Arms */}
        <div className={`arm left ${isWaving ? 'waving' : ''}`}>
          <div className="hand"></div>
        </div>
        <div className="arm right">
          <div className="hand"></div>
        </div>

        {/* Legs */}
        <div className="legs-container">
          <div className="leg left">
            <div className="foot"></div>
          </div>
          <div className="leg right">
            <div className="foot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Physics Engine for Bouncing Pearls
const usePhysicsEngine = (customers) => {
  const [pearls, setPearls] = useState([]);
  const animationRef = useRef();
  const pearlsRef = useRef([]);

  // Container dimensions (inside the cup)
  const CONTAINER_WIDTH = 740;
  const CONTAINER_HEIGHT = 800;
  const GRAVITY = 0.8;
  const FRICTION = 0.98;
  const BOUNCE_DAMPING = 0.7;
  const COLLISION_DAMPING = 0.8;

  // Initialize pearls when customers change
  useEffect(() => {
    const newPearls = customers.map((customer, index) => {
      const orders = customer.currentMonthOrders || Math.floor(customer.points / 10);
      const size = Math.max(orders < 5 ? 45 : orders < 15 ? 55 : orders < 30 ? 65 : 75, 35);
      const radius = size / 2;

      // Find existing pearl or create new one
      const existingPearl = pearlsRef.current.find(p => p.id === customer.id);
      
      if (existingPearl) {
        return { ...existingPearl, size, radius };
      }

      // New pearl - drop from random position at top
      return {
        id: customer.id,
        customer,
        index,
        x: Math.random() * (CONTAINER_WIDTH - size) + radius,
        y: -100 - (index * 50),
        vx: (Math.random() - 0.5) * 4,
        vy: 0,
        size,
        radius,
        isNew: true,
        bouncing: false,
      };
    });

    pearlsRef.current = newPearls;
    setPearls([...newPearls]);
  }, [customers]);

  // Collision detection between two circles
  const checkCollision = (pearl1, pearl2) => {
    const dx = pearl1.x - pearl2.x;
    const dy = pearl1.y - pearl2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = pearl1.radius + pearl2.radius;
    
    return distance < minDistance;
  };

  // Resolve collision between two pearls
  const resolveCollision = (pearl1, pearl2) => {
    const dx = pearl1.x - pearl2.x;
    const dy = pearl1.y - pearl2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = pearl1.radius + pearl2.radius;
    
    if (distance < minDistance) {
      // Separate pearls
      const overlap = minDistance - distance;
      const separationX = (dx / distance) * overlap * 0.5;
      const separationY = (dy / distance) * overlap * 0.5;
      
      pearl1.x += separationX;
      pearl1.y += separationY;
      pearl2.x -= separationX;
      pearl2.y -= separationY;
      
      // Exchange velocities (simplified elastic collision)
      const tempVx = pearl1.vx;
      const tempVy = pearl1.vy;
      pearl1.vx = pearl2.vx * COLLISION_DAMPING;
      pearl1.vy = pearl2.vy * COLLISION_DAMPING;
      pearl2.vx = tempVx * COLLISION_DAMPING;
      pearl2.vy = tempVy * COLLISION_DAMPING;
      
      // Add bounce effect
      pearl1.bouncing = true;
      pearl2.bouncing = true;
      setTimeout(() => {
        pearl1.bouncing = false;
        pearl2.bouncing = false;
      }, 300);
    }
  };

  // Physics update loop
  const updatePhysics = () => {
    setPearls(currentPearls => {
      const updatedPearls = currentPearls.map(pearl => {
        const newPearl = { ...pearl };
        
        // Apply gravity
        newPearl.vy += GRAVITY;
        
        // Update position
        newPearl.x += newPearl.vx;
        newPearl.y += newPearl.vy;
        
        // Apply friction
        newPearl.vx *= FRICTION;
        newPearl.vy *= FRICTION;
        
        // Floor collision (bottom of cup)
        if (newPearl.y + newPearl.radius >= CONTAINER_HEIGHT) {
          newPearl.y = CONTAINER_HEIGHT - newPearl.radius;
          newPearl.vy *= -BOUNCE_DAMPING;
          newPearl.bouncing = true;
          setTimeout(() => newPearl.bouncing = false, 300);
          
          // Stop tiny bounces
          if (Math.abs(newPearl.vy) < 1) {
            newPearl.vy = 0;
          }
        }
        
        // Wall collisions (sides of cup)
        if (newPearl.x - newPearl.radius <= 0) {
          newPearl.x = newPearl.radius;
          newPearl.vx *= -BOUNCE_DAMPING;
        }
        if (newPearl.x + newPearl.radius >= CONTAINER_WIDTH) {
          newPearl.x = CONTAINER_WIDTH - newPearl.radius;
          newPearl.vx *= -BOUNCE_DAMPING;
        }
        
        newPearl.isNew = false;
        return newPearl;
      });
      
      // Check collisions between all pearls
      for (let i = 0; i < updatedPearls.length; i++) {
        for (let j = i + 1; j < updatedPearls.length; j++) {
          if (checkCollision(updatedPearls[i], updatedPearls[j])) {
            resolveCollision(updatedPearls[i], updatedPearls[j]);
          }
        }
      }
      
      pearlsRef.current = updatedPearls;
      return updatedPearls;
    });
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return pearls;
};

// Physics-based Customer Pearl Component
const CustomerPearl = ({ pearl }) => {
  const { customer, x, y, size, bouncing, index } = pearl;
  
  return (
    <div
      className={`physics-pearl ${bouncing ? 'bouncing' : ''}`}
      style={{
        left: `${x - size/2}px`,
        top: `${y - size/2}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(https://i.pravatar.cc/150?img=${customer.id})`,
        zIndex: 50 + Math.floor(y / 10),
      }}
    >
      {index < 3 && (
        <div style={{
          position: 'absolute',
          top: '-18px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '18px',
          zIndex: 100,
        }}>
          {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
        </div>
      )}
    </div>
  );
};

// Main BobaCupDisplay Component
const BobaCupDisplay = ({ customers = [] }) => {
  const physicalPearls = usePhysicsEngine(customers);

  return (
    <div className="mt-8">
      <BobaCupCharacter customerCount={customers.length}>
        {physicalPearls.map((pearl) => (
          <CustomerPearl key={pearl.id} pearl={pearl} />
        ))}
      </BobaCupCharacter>
    </div>
  );
};

export default BobaCupDisplay;
