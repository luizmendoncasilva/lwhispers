-- CreateSequence + Column
CREATE SEQUENCE IF NOT EXISTS tarefa_numero_seq;
ALTER TABLE "Tarefa" ADD COLUMN "numero" INTEGER NOT NULL DEFAULT nextval('tarefa_numero_seq');
ALTER SEQUENCE tarefa_numero_seq OWNED BY "Tarefa"."numero";

-- CreateIndex
CREATE UNIQUE INDEX "Tarefa_numero_key" ON "Tarefa"("numero");
