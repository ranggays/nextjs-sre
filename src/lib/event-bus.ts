// lib/event-bus.ts
import mitt from 'mitt';

type Events = {
  sessionCreated: void;
  sessionDeleted: string; // bisa pakai string atau { id: string } kalau mau fleksibel
  sessionUpdated: string;
};

export const eventBus = mitt<Events>();
