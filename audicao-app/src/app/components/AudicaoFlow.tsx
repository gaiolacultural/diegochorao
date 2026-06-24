"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

const trackNames = [
  "INTRO",
  "SABOR MC",
  "THIAGO, TIAGO",
  "SER OU NÃO SER",
  "CORPOS VAZIOS",
  "PELAS RUAS",
  "BOOMBAP KING",
  "LIXOS",
  "20 MIL MOTIVOS"
];

const audioFiles = [
  "1.mp3",
  "2.mp3",
  "3.mp3",
  "4.mp3",
  "5.mp3",
  "6.mp3",
  "7.mp3",
  "8.mp3",
  "9.mp3"
];

export default function AudicaoFlow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ranking Final state - inicialmente vazio
  const [ranking, setRanking] = useState<{id: string, name: string, originalIndex: number}[]>([]);

  // Control Audio
  useEffect(() => {
    if (currentIndex < 9 && audioRef.current) {
      setProgress(0);
      audioRef.current.load();
      audioRef.current.play().catch(() => console.log('Autoplay prevented'));
    }
  }, [currentIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setProgress(current / total);
    }
  };

  const handleNext = () => {
    if (currentIndex < 9) setCurrentIndex(p => p + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(p => p - 1);
  };

  const pizzaDegrees = progress * 360;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: "url('/poesiadeboteco/FUNDO.jpg')",
          filter: "sepia(0.4) contrast(1.1) brightness(0.6) saturate(1.2)" 
        }}
      />

      {/* Alterei de justify-center para justify-start e reduzi pt para 2vh para colar quase no topo absoluto */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-[2vh] p-4">

        {currentIndex < 9 ? (
          <div className="relative flex flex-col items-center w-[95%] max-w-xl md:max-w-2xl">
            
            <audio 
              ref={audioRef} 
              src={`/poesiadeboteco/${audioFiles[currentIndex]}`} 
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleNext}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) handleNext();
                  else if (swipe > swipeConfidenceThreshold) handlePrev();
                }}
                className="relative w-full cursor-grab active:cursor-grabbing bg-transparent"
              >
                <div className="relative mx-auto w-[95%] sm:w-[85%] md:w-[85%]">
                  {/* Imagem Horizontal do Cardápio - Agora fluida sem travar o aspect ratio */}
                  <img 
                    src={`/poesiadeboteco/0${currentIndex + 1}.png?v=5`} 
                    alt={`Faixa ${currentIndex + 1}`} 
                    className="w-full h-auto pointer-events-none drop-shadow-2xl"
                  />

                  {/* Bolacha travada nos parâmetros fornecidos */}
                  <div 
                    className="absolute cursor-pointer hover:scale-105 transition-transform z-20 flex items-center justify-center"
                    style={{ 
                      top: `46%`, 
                      left: `9%`, 
                      width: `20%`,
                      aspectRatio: '1/1'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (audioRef.current) {
                        if (audioRef.current.paused) audioRef.current.play();
                        else audioRef.current.pause();
                      }
                    }}
                    title="Tocar Música"
                  >
                    <img src="/poesiadeboteco/bolacha-marrom.png" className="absolute inset-0 w-full h-full object-contain opacity-10 drop-shadow-lg" alt="Bolacha base" />
                    
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden"
                      style={{
                        maskImage: `conic-gradient(black ${pizzaDegrees}deg, transparent ${pizzaDegrees}deg)`,
                        WebkitMaskImage: `conic-gradient(black ${pizzaDegrees}deg, transparent ${pizzaDegrees}deg)`
                      }}
                    >
                      <img src="/poesiadeboteco/bolacha-marrom.png" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" alt="Bolacha preenchida" />
                    </div>

                    <div className={`absolute inset-0 flex items-center justify-center z-30 transition-opacity duration-300 ${
                      (currentIndex === 0 && !isPlaying) ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                    }`}>
                      <div className="bg-black/20 p-3 md:p-4 rounded-full backdrop-blur-sm border border-white/10 shadow flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="text-white/90 w-6 h-6 md:w-10 md:h-10 drop-shadow-md" fill="currentColor" />
                        ) : (
                          <Play className="text-white/90 w-6 h-6 md:w-10 md:h-10 ml-1 drop-shadow-md" fill="currentColor" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão "Próxima Rodada" */}
                  <div 
                    className="absolute bottom-[8%] right-[5%] w-[35%] h-[15%] cursor-pointer z-30 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    title="Próxima Rodada"
                  >
                  </div>

                  {/* Botão para "Voltar" */}
                  {currentIndex > 0 && (
                    <div 
                      className="absolute bottom-[8%] left-[45%] w-[20%] h-[15%] cursor-pointer z-30 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      title="Voltar"
                    >
                    </div>
                  )}
                </div>
                
              </motion.div>
            </AnimatePresence>

          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center w-[95%] max-w-xl md:max-w-2xl"
          >
            {/* Imagem FINAL de fundo - O usuário vai trocar essa arte depois */}
            <div className="relative w-[95%] sm:w-[85%] md:w-[85%] mx-auto">
              <img 
                src="/poesiadeboteco/FINAL.png?v=3" 
                alt="Ranking Final" 
                className="w-full h-auto pointer-events-none drop-shadow-2xl"
              />

              {/* Hitboxes invisíveis para Seleção Única (sobre a imagem) */}
              <div className="absolute top-[45.5%] left-[10%] right-[10%] bottom-[9.5%] flex flex-col z-20 gap-0">
                {trackNames.map((name, index) => (
                  <div
                    key={name}
                    onClick={() => setRanking([{ id: name, name, originalIndex: index }])}
                    className={`
                      w-full flex-1 rounded-lg cursor-pointer transition-all border-2
                      ${ranking.length > 0 && ranking[0].id === name 
                        ? 'bg-white/20 border-white/60 shadow-lg scale-105' 
                        : 'bg-transparent border-transparent hover:bg-white/10 hover:border-white/30'
                      }
                    `}
                    title={`Votar em ${name}`}
                  />
                ))}
              </div>

              {/* Botão Enviar/Salvar */}
              <div 
                className={`absolute bottom-[8%] right-[5%] w-[35%] h-[15%] cursor-pointer z-30 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all duration-300
                  ${ranking.length > 0 ? 'opacity-100 hover:scale-105' : 'opacity-50 cursor-not-allowed'}
                `}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (ranking.length > 0) {
                    try {
                      const res = await fetch("/poesiadeboteco/api/vote", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ trackName: ranking[0].name })
                      });
                      if (res.ok) {
                        alert("VOTO ENVIADO COM SUCESSO!");
                        window.location.href = "https://diegochorao.gaiolarecords.com.br";
                      } else {
                        alert("Erro ao registrar voto. Tente novamente.");
                      }
                    } catch (err) {
                      alert("Erro na conexão. Verifique sua internet.");
                    }
                  }
                }}
                title="Salvar Escolha"
              >
              </div>

              {/* Hitbox para voltar */}
              <div 
                className="absolute bottom-[8%] left-[45%] w-[20%] h-[15%] cursor-pointer z-30 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                title="Voltar"
              >
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}

// Helpers for swipe detection
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
