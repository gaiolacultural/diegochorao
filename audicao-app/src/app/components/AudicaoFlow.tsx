"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  "1. INTRO (MASTER).wav",
  "2. SABOR MC (MASTER).wav",
  "3. THIAGO, TIAGO (MASTER).wav",
  "4. SER OU NÃO SER (MASTER).wav",
  "5. CORPOS VAZIOS (MASTER).wav",
  "6. PELAS RUAS (MASTER).wav",
  "7. BOOMBAP KING (MASTER).wav",
  "8. LIXOS (MASTER).wav",
  "9. 20 MIL MOTIVOS (MASTER).wav"
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === 'left' && destination.droppableId === 'right') {
      // Movendo da esquerda para a direita (adicionando ao ranking)
      const track = trackNames.find(t => t === draggableId);
      if (track) {
        const newRanking = Array.from(ranking);
        newRanking.splice(destination.index, 0, { id: track, name: track, originalIndex: 0 });
        setRanking(newRanking);
      }
    } else if (source.droppableId === 'right' && destination.droppableId === 'right') {
      // Reordenando dentro da lista da direita
      const newRanking = Array.from(ranking);
      const [removed] = newRanking.splice(source.index, 1);
      newRanking.splice(destination.index, 0, removed);
      setRanking(newRanking);
    } else if (source.droppableId === 'right' && destination.droppableId === 'left') {
      // Removendo do ranking (voltando para a esquerda)
      const newRanking = Array.from(ranking);
      newRanking.splice(source.index, 1);
      setRanking(newRanking);
    }
  };

  const bolachaOpacity = 0.3 + (0.7 * progress);
  const pizzaDegrees = progress * 360;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans">
      
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: "url('/FUNDO.jpg')",
          filter: "sepia(0.4) contrast(1.1) brightness(0.6) saturate(1.2)" 
        }}
      />

      {/* Alterei de justify-center para justify-start e reduzi pt para 2vh para colar quase no topo absoluto */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-[2vh] p-4">

        {currentIndex < 9 ? (
          <div className="relative flex flex-col items-center w-[95%] max-w-xl md:max-w-2xl">
            
            <audio 
              ref={audioRef} 
              src={`/${audioFiles[currentIndex]}`} 
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
                {/* Imagem Horizontal do Cardápio - Agora fluida sem travar o aspect ratio */}
                <img 
                  src={`/${currentIndex + 1}.png`} 
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
                  onClick={() => {
                    if (audioRef.current) {
                      if (audioRef.current.paused) audioRef.current.play();
                      else audioRef.current.pause();
                    }
                  }}
                  title="Tocar Música"
                >
                  {/* Removido o rounded-full e alterado para object-contain para não cortar o P e o O */}
                  <img src="/bolacha-marrom.png" className="absolute inset-0 w-full h-full object-contain opacity-80 drop-shadow-lg" alt="Bolacha base" />
                  
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{
                      maskImage: `conic-gradient(black ${pizzaDegrees}deg, transparent ${pizzaDegrees}deg)`,
                      WebkitMaskImage: `conic-gradient(black ${pizzaDegrees}deg, transparent ${pizzaDegrees}deg)`
                    }}
                  >
                    <img src="/bolacha-marrom.png" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" alt="Bolacha preenchida" />
                  </div>

                  {/* Ícone de Play/Pause ao passar o mouse (visível por padrão na primeira música se pausada) */}
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

                {/* Botão invisível "Próxima Rodada" no canto inferior direito */}
                <div 
                  className="absolute bottom-[8%] right-[5%] w-[35%] h-[15%] cursor-pointer z-30 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  title="Próxima Rodada"
                >
                  <span className="text-white/30 text-xs font-bold pointer-events-none opacity-0 hover:opacity-100">CLIQUE AQUI</span>
                </div>

                {/* Botão invisível para "Voltar" (lado inferior esquerdo da tela) */}
                {currentIndex > 0 && (
                  <div 
                    className="absolute bottom-[8%] left-[45%] w-[20%] h-[15%] cursor-pointer z-30 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    title="Voltar"
                  >
                    <span className="text-white/30 text-xs font-bold pointer-events-none opacity-0 hover:opacity-100">VOLTAR</span>
                  </div>
                )}
                
              </motion.div>
            </AnimatePresence>

          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center w-[95%] max-w-xl md:max-w-2xl"
          >
            {/* Imagem FINAL de fundo */}
            <img 
              src="/FINAL.png" 
              alt="Ranking Final" 
              className="w-full h-auto pointer-events-none drop-shadow-2xl"
            />

            <DragDropContext onDragEnd={onDragEnd}>
              {/* ESQUERDA: Lista de Origem (Transparente sobre a arte) */}
              <div className="absolute top-[41%] left-[6%] w-[40%] h-[47%] flex flex-col">
                <Droppable droppableId="left">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="w-full h-full flex flex-col"
                    >
                      {trackNames.map((name, index) => {
                        const isRanked = ranking.some(r => r.id === name);
                        return isRanked ? (
                          // Espaço vazio com altura exata da linha
                          <div key={`empty-${name}`} className="w-full h-[11.1%]" />
                        ) : (
                          <Draggable key={name} draggableId={name} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  w-full h-[11.1%] flex items-center px-1 cursor-grab active:cursor-grabbing
                                  ${snapshot.isDragging ? 'scale-110 z-50 drop-shadow-xl opacity-100' : 'bg-transparent text-transparent hover:bg-black/5'}
                                `}
                              >
                                {/* Estilo imitando o texto da arte (preto e maior) quando arrastado */}
                                <span className={`font-black text-[13px] md:text-[17px] text-[#1a110b] uppercase tracking-tighter ${snapshot.isDragging ? 'opacity-100' : 'opacity-0'}`}>
                                  {name}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* DIREITA: Lista de Destino (Ranking) */}
              <div className="absolute top-[41%] right-[4%] w-[46%] h-[47%] flex flex-col">
                <Droppable droppableId="right">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="w-full h-full flex flex-col"
                    >
                      {ranking.length === 0 && (
                         <div className="text-black/30 font-bold text-[10px] md:text-xs text-center mt-4">Puxe pra cá</div>
                      )}
                      {ranking.map((item, index) => (
                        <Draggable key={`ranked-${item.id}`} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                w-full h-[11.1%] flex items-center px-1 cursor-grab active:cursor-grabbing bg-transparent text-[#1a110b]
                                ${snapshot.isDragging ? 'scale-110 z-50 drop-shadow-xl' : 'hover:scale-105'}
                              `}
                            >
                              <span className="font-black text-[13px] md:text-[17px] uppercase tracking-tighter flex-1">{item.name}</span>
                              <span className="opacity-20 text-xs px-1">≡</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
            
            {/* Botão Enviar/Salvar */}
            <div 
              className="absolute bottom-[3.5%] right-[0%] w-[22.9%] h-[15%] cursor-pointer z-30 flex items-center justify-center hover:scale-105 transition-transform"
              onClick={() => {
                alert("Ranking salvo! (Integração com backend pendente)");
              }}
              title="Salvar Ranking"
            >
               <span 
                 className="font-black uppercase tracking-tighter"
                 style={{ 
                   fontSize: `16px`, 
                   color: `rgb(140, 55, 20)`,
                   textShadow: "0px 2px 4px rgba(0,0,0,0.3)" // Pequena sombra para destacar
                 }}
               >
                 ENVIAR
               </span>
            </div>

            {/* Hitbox para voltar */}
            <div 
              className="absolute cursor-pointer z-30 flex items-center justify-center hover:scale-105 transition-transform"
              style={{
                bottom: `3.5%`,
                left: `64.7%`,
                width: `22.9%`,
                height: `15%`,
              }}
              onClick={handlePrev}
              title="Voltar"
            >
               <span 
                 className="font-black uppercase tracking-tighter"
                 style={{ 
                   fontSize: `16px`, 
                   color: `rgb(140, 55, 20)`,
                   textShadow: "0px 2px 4px rgba(0,0,0,0.3)"
                 }}
               >
                 VOLTAR
               </span>
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
