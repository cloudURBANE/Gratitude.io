CREATE TABLE "analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"total_tips" integer DEFAULT 0,
	"total_amount" numeric(10, 2) DEFAULT '0',
	"avg_tip_amount" numeric(10, 2) DEFAULT '0',
	"top_payment_method" varchar(20),
	"qr_scans" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "qr_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"referrer" text,
	"converted_to_tip" boolean DEFAULT false,
	"tip_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(20) NOT NULL,
	"payment_intent_id" varchar(100),
	"customer_name" varchar(100),
	"note" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(100) NOT NULL,
	"location" varchar(100),
	"handle" varchar(50) NOT NULL,
	"avatar_url" text,
	"venmo_handle" varchar(50),
	"cashapp_handle" varchar(50),
	"zelle_info" varchar(100),
	"stripe_account_id" varchar(100),
	"google_review_url" text,
	"yelp_review_url" text,
	"qr_code_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workers_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_tip_id_tips_id_fk" FOREIGN KEY ("tip_id") REFERENCES "public"."tips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tips" ADD CONSTRAINT "tips_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;