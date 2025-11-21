CREATE TABLE IF NOT EXISTS "InviteCode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(32) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"usedAt" timestamp,
	"usedBy" uuid,
	"createdBy" uuid,
	"maxUses" varchar(10) DEFAULT '1',
	"currentUses" varchar(10) DEFAULT '0',
	"expiresAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	CONSTRAINT "InviteCode_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_usedBy_User_id_fk" FOREIGN KEY ("usedBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_createdBy_User_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
