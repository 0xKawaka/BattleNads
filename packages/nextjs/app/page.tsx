"use client";

import React, { useState, useRef } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import team1 from './assets/team1.png';
import team2 from './assets/team2.png';

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { data: team } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "playerTeam",
    args: [connectedAddress],
  });

  const { data: team1Health } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "team1Health",
  });

  const { data: team2Health } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "team2Health",
  });

  const { data: maxHealth } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "MAX_HEALTH",
  });
  

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "YourContract" });

  // State to trigger the attack animation for the attacking team
  const [attackingAnimation, setAttackingAnimation] = useState(false);
  // State to hold damage animations; each new attack pushes a new entry with a unique id and team
  const [damageAnimations, setDamageAnimations] = useState<Array<{ team: number; id: string }>>([]);
  const damageAnimationIdRef = useRef(0);

  // New state to trigger a shake animation for the team taking damage
  const [damagedTeam, setDamagedTeam] = useState<number | null>(null);


  return (
    <div className="flex items-center justify-center bg-base-100 h-[80vh]">
      {connectedAddress && (
        <div className="">
          {(!team || team === 0) ? (
            <>
              <h2 className="text-3xl mb-6 text-center">Pick Your Team</h2>
              <div className="flex gap-3 sm:gap-12 justify-center">
                <div
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      await writeContractAsync({
                        functionName: "joinTeam",
                        args: [1],
                      });
                    } catch (error) {
                      console.error("Error joining Team 1:", error);
                    }
                  }}
                >
                  <img
                    src={team1.src}
                    alt="Team 1"
                    className="w-36 h-36 sm:w-64 sm:h-64 transition-transform duration-200 transform hover:scale-110"
                  />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      await writeContractAsync({
                        functionName: "joinTeam",
                        args: [2],
                      });
                    } catch (error) {
                      console.error("Error joining Team 2:", error);
                    }
                  }}
                >
                  <img
                    src={team2.src}
                    alt="Team 2"
                    className="w-36 h-36 sm:w-64 sm:h-64 transition-transform duration-200 transform hover:scale-110"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Container holding both teams images and health bars */}
              <div className="flex justify-center gap-3 sm:gap-12 mb-6">
                <div className="flex flex-col items-center relative">
                  <img
                    src={team1.src}
                    alt="Team 1"
                    className={`w-36 h-36 sm:w-64 sm:h-64 ${team === 1 && attackingAnimation ? "attack-animation-right" : ""} ${damagedTeam === 1 ? "damage-shake" : ""}`}
                  />
                  {/* Health bar for Team 1 */}
                  <div className="health-bar">
                    <div
                      className="health-bar-fill"
                      style={{ width: `${(Number(team1Health) / Number(maxHealth)) * 100}%` }}
                    ></div>
                    <div className="health-bar-text">
                      {String(team1Health)}/{Number(maxHealth)}
                    </div>
                  </div>
                  {damageAnimations
                    .filter((anim) => anim.team === 1)
                    .map((anim) => (
                      <div key={anim.id} className="damage-animation damage-left text-4xl sm:text-6xl">-1</div>
                    ))}
                </div>
                <div className="flex flex-col items-center relative">
                  <img
                    src={team2.src}
                    alt="Team 2"
                    className={`w-36 h-36 sm:w-64 sm:h-64 ${team === 2 && attackingAnimation ? "attack-animation-left" : ""} ${damagedTeam === 2 ? "damage-shake" : ""}`}
                  />
                  {/* Health bar for Team 2 */}
                  <div className="health-bar">
                    <div
                      className="health-bar-fill"
                      style={{ width: `${(Number(team2Health) / Number(maxHealth)) * 100}%` }}
                    ></div>
                    <div className="health-bar-text">
                      {String(team2Health)}/{Number(maxHealth)}
                    </div>
                  </div>
                  {damageAnimations
                    .filter((anim) => anim.team === 2)
                    .map((anim) => (
                      <div key={anim.id} className="damage-animation damage-right text-4xl sm:text-6xl">-1</div>
                    ))}
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  className="btn btn-attack"
                  onClick={async () => {
                    try {
                      await writeContractAsync({ functionName: "attack" });
                      if (team === 1) {
                        // Team 1 attacks Team 2.
                        setAttackingAnimation(true);
                        setTimeout(() => setAttackingAnimation(false), 500);

                        const newId = "damage-" + damageAnimationIdRef.current++;
                        setDamageAnimations((prev) => [...prev, { team: 2, id: newId }]);
                        // Trigger shake on the damaged enemy team
                        setDamagedTeam(2);
                        setTimeout(() => setDamagedTeam(null), 500);

                        setTimeout(() => {
                          setDamageAnimations((prev) =>
                            prev.filter((anim) => anim.id !== newId)
                          );
                        }, 1000);
                      } else if (team === 2) {
                        // Team 2 attacks Team 1.
                        setAttackingAnimation(true);
                        setTimeout(() => setAttackingAnimation(false), 500);

                        const newId = "damage-" + damageAnimationIdRef.current++;
                        setDamageAnimations((prev) => [...prev, { team: 1, id: newId }]);
                        // Trigger shake on the damaged enemy team
                        setDamagedTeam(1);
                        setTimeout(() => setDamagedTeam(null), 500);

                        setTimeout(() => {
                          setDamageAnimations((prev) =>
                            prev.filter((anim) => anim.id !== newId)
                          );
                        }, 1000);
                      }
                    } catch (error) {
                      console.error("Error attacking:", error);
                    }
                  }}
                >
                  Attack
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS animations for attack, damage indicators, damage shake and health bars */}
      <style jsx>{`
        /* Attack animations: move toward the enemy and then return */
        @keyframes attack-right {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(30px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .attack-animation-right {
          animation: attack-right 0.5s ease-in-out;
        }
        
        @keyframes attack-left {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-30px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .attack-animation-left {
          animation: attack-left 0.5s ease-in-out;
        }
        
        /* Damage indicator animations:
           - For Team 1: slide left (since an attack from Team 2 comes from the right)
           - For Team 2: slide right (attack from Team 1 comes from the left)
        */
        @keyframes damage-left {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0.2;
            transform: translate(-200%, -50%);
          }
        }
        .damage-left {
          animation: damage-left 1s ease-out forwards;
        }
        
        @keyframes damage-right {
          0% {
            opacity: 1;
            transform: translate(50%, 0);
          }
          100% {
            opacity: 0.2;
            transform: translate(200%, -50%);
          }
        }
        .damage-right {
          animation: damage-right 1s ease-out forwards;
        }
        
        .damage-animation {
          position: absolute;
          top: 10%;
          left: 50%;
          color: red;
        }

        /* Damaged shake animation for the team taking damage */
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5%);
          }
          50% {
            transform: translateX(5%);
          }
          75% {
            transform: translateX(-5%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .damage-shake {
          animation: shake 0.5s ease-in-out;
        }

        /* --- Updated styles for the Attack button --- */
        .btn-attack {
          background-color: rgba(131, 110, 249, 1);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-size: 1.25rem;
          transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .btn-attack:hover {
          background-color: #8b69ed;
          box-shadow: 0 4px 10px rgba(131, 110, 249, 0.5);
        }

        /* Health bar styles */
        .health-bar {
          width: 150px;
          height: 30px;
          border: 2px solid rgba(131, 110, 249, 1);
          border-radius: 5px;
          position: relative;
          background-color: #E5E7EB;
          margin-top: 10px;
        }
        .health-bar-fill {
          height: 100%;
          background-color: rgba(131, 110, 249, 1);
          border-radius: 5px;
          transition: width 0.5s ease-in-out;
        }
        .health-bar-text {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
        }

        /* Mobile scaling for healthbar and attack button */
        @media (max-width: 640px) {
          .health-bar {
            width: 120px;
            height: 25px;
          }
          .btn-attack {
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;

