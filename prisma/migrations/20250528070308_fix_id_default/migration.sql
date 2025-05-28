-- AlterTable
CREATE SEQUENCE node_id_seq;
ALTER TABLE "Node" ALTER COLUMN "id" SET DEFAULT nextval('node_id_seq');
ALTER SEQUENCE node_id_seq OWNED BY "Node"."id";
