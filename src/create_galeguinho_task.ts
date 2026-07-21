import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const createCard = async () => {
  const cardId = `card-galeguinho-${Date.now()}`;
  const newCard = {
    id: cardId,
    // We will place this in the general board, in a "To Do" or first column
    // Since we don't know the exact column ID, we can just assign a dummy one or grab one.
    // If the board-general doesn't have a column yet, it might not render in Kanban, 
    // but it will render in Canvas. Let's assume 'col-todo' exists or we can just give it 'col-galeguinho'.
    columnId: 'col-todo', 
    boardId: 'board-general',
    companyName: 'Todas as Empresas',
    title: 'Projeto Estoque Unificado - Galeguinho',
    description: `Galeguinho, dar continuidade no sistema de estoque unificado que abrange todas as empresas.
Link do Sistema em Produção: https://central-estoque-v1.vercel.app/
Link para Baixar o Projeto Original: https://www.mediafire.com/file/0cbvaidz42o6p7l/central-estoque-v1-main.zip/file

Por favor, faça as implementações pendentes listadas no checklist abaixo, anexe o que for necessário, e depois marque como Concluído!`,
    priority: 'high',
    createdAt: new Date().toISOString(),
    completed: false,
    order: 0,
    subtasks: [
      { id: 'sub-1', text: 'Baixar e analisar o código fonte atual', completed: false },
      { id: 'sub-2', text: 'Mapear os requisitos que faltam para englobar todas as empresas', completed: false },
      { id: 'sub-3', text: 'Refatorar banco de dados/estado para suportar múltiplas filiais', completed: false },
      { id: 'sub-4', text: 'Subir a nova versão e testar (Anexe o novo link abaixo)', completed: false }
    ],
    attachments: [
      { id: 'att-1', name: 'Sistema Atual', url: 'https://central-estoque-v1.vercel.app/', type: 'link' },
      { id: 'att-2', name: 'Código Fonte (ZIP)', url: 'https://www.mediafire.com/file/0cbvaidz42o6p7l/central-estoque-v1-main.zip/file', type: 'link' }
    ],
    comments: [],
    x: 100, // Position on canvas
    y: 100,
    customBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    customBorder: 'border-2 border-emerald-500'
  };

  try {
    await setDoc(doc(db, 'cards', cardId), newCard);
    console.log(`\n\n=== SUCESSO! ===`);
    console.log(`A demanda para o Galeguinho foi criada no banco de dados!`);
    console.log(`Envie este link para ele:`);
    console.log(`http://localhost:3000/demand/${cardId}`);
    console.log(`================\n\n`);
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar demanda:", error);
    process.exit(1);
  }
};

createCard();
