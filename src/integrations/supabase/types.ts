export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_outputs: {
        Row: {
          created_at: string
          id: string
          input_summary: Json
          model_version: string
          output_text: string
          signed_off_at: string | null
          updated_at: string
          user_id: string
          user_signoff: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          input_summary: Json
          model_version?: string
          output_text: string
          signed_off_at?: string | null
          updated_at?: string
          user_id: string
          user_signoff?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          input_summary?: Json
          model_version?: string
          output_text?: string
          signed_off_at?: string | null
          updated_at?: string
          user_id?: string
          user_signoff?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      case_events: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          data: Json | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          title: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          data?: Json | null
          description?: string | null
          event_date?: string
          event_type: string
          id?: string
          title: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          data?: Json | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_revisions: {
        Row: {
          case_id: string
          change_type: string
          changed_by: string
          changed_fields: Json
          created_at: string
          id: string
          new_snapshot: Json
          previous_snapshot: Json | null
          revision_number: number
        }
        Insert: {
          case_id: string
          change_type: string
          changed_by: string
          changed_fields?: Json
          created_at?: string
          id?: string
          new_snapshot: Json
          previous_snapshot?: Json | null
          revision_number: number
        }
        Update: {
          case_id?: string
          change_type?: string
          changed_by?: string
          changed_fields?: Json
          created_at?: string
          id?: string
          new_snapshot?: Json
          previous_snapshot?: Json | null
          revision_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_revisions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          category: string
          created_at: string
          created_by: string
          id: string
          institution_id: string | null
          patient_id: string
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          id?: string
          institution_id?: string | null
          patient_id: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          institution_id?: string | null
          patient_id?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_signoffs: {
        Row: {
          cosigned_at: string | null
          cosigned_by: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          justification: string | null
          metadata: Json | null
          signed_at: string | null
          signed_by: string
          status: string
          updated_at: string
        }
        Insert: {
          cosigned_at?: string | null
          cosigned_by?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          justification?: string | null
          metadata?: Json | null
          signed_at?: string | null
          signed_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          cosigned_at?: string | null
          cosigned_by?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          justification?: string | null
          metadata?: Json | null
          signed_at?: string | null
          signed_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      consents: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          patient_id: string | null
          revoked_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          patient_id?: string | null
          revoked_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          patient_id?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          difficulty: string
          duration_hours: number | null
          id: string
          is_published: boolean
          title: string
          track: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string
          duration_hours?: number | null
          id?: string
          is_published?: boolean
          title: string
          track: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string
          duration_hours?: number | null
          id?: string
          is_published?: boolean
          title?: string
          track?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_lifecycle_policies: {
        Row: {
          automatic_action: string
          created_at: string
          description: string | null
          entity_type: string
          id: string
          legal_basis: string
          retention_days: number
          updated_at: string
        }
        Insert: {
          automatic_action?: string
          created_at?: string
          description?: string | null
          entity_type: string
          id?: string
          legal_basis: string
          retention_days: number
          updated_at?: string
        }
        Update: {
          automatic_action?: string
          created_at?: string
          description?: string | null
          entity_type?: string
          id?: string
          legal_basis?: string
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      dpia_assessments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          data_categories: string[]
          id: string
          legal_basis: string
          mitigation_measures: Json
          processing_purpose: string
          residual_risk_level: string
          risks: Json
          scope: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          data_categories?: string[]
          id?: string
          legal_basis: string
          mitigation_measures?: Json
          processing_purpose: string
          residual_risk_level?: string
          risks?: Json
          scope: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          data_categories?: string[]
          id?: string
          legal_basis?: string
          mitigation_measures?: Json
          processing_purpose?: string
          residual_risk_level?: string
          risks?: Json
          scope?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      eco_metrics: {
        Row: {
          case_id: string
          contrast_agent_type: string
          contrast_volume_ml: number
          created_at: string
          created_by: string
          eco_impact_score: number
          gadolinium_avoided_mg: number
          id: string
          updated_at: string
          water_contamination_prevented_l: number
        }
        Insert: {
          case_id: string
          contrast_agent_type?: string
          contrast_volume_ml?: number
          created_at?: string
          created_by: string
          eco_impact_score?: number
          gadolinium_avoided_mg?: number
          id?: string
          updated_at?: string
          water_contamination_prevented_l?: number
        }
        Update: {
          case_id?: string
          contrast_agent_type?: string
          contrast_volume_ml?: number
          created_at?: string
          created_by?: string
          eco_impact_score?: number
          gadolinium_avoided_mg?: number
          id?: string
          updated_at?: string
          water_contamination_prevented_l?: number
        }
        Relationships: [
          {
            foreignKeyName: "eco_metrics_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_requests: {
        Row: {
          case_summary: string
          created_at: string
          id: string
          requester_id: string
          status: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          case_summary: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          case_summary?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      expert_responses: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          request_id: string
          response_text: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          request_id: string
          response_text: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          request_id?: string
          response_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "expert_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          created_at: string
          export_type: string
          file_url: string | null
          id: string
          row_count: number | null
          study_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          export_type: string
          file_url?: string | null
          id?: string
          row_count?: number | null
          study_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          export_type?: string
          file_url?: string | null
          id?: string
          row_count?: number | null
          study_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          parent_id: string | null
          title: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          parent_id?: string | null
          title: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          parent_id?: string | null
          title?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_events: {
        Row: {
          actor_id: string | null
          context: Json | null
          created_at: string
          event_action: string
          event_category: string
          id: string
          institution_id: string | null
          severity: string
          target_entity_id: string | null
          target_entity_type: string | null
          target_user_id: string | null
        }
        Insert: {
          actor_id?: string | null
          context?: Json | null
          created_at?: string
          event_action: string
          event_category: string
          id?: string
          institution_id?: string | null
          severity?: string
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
        }
        Update: {
          actor_id?: string | null
          context?: Json | null
          created_at?: string
          event_action?: string
          event_category?: string
          id?: string
          institution_id?: string | null
          severity?: string
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      imaging_summaries: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          findings: string | null
          id: string
          measurements: Json | null
          modality: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          findings?: string | null
          id?: string
          measurements?: Json | null
          modality: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          findings?: string | null
          id?: string
          measurements?: Json | null
          modality?: string
        }
        Relationships: [
          {
            foreignKeyName: "imaging_summaries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      logbook_entries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          performed_at: string
          procedure_type: string
          supervisor_id: string | null
          supervisor_validated: boolean
          track: string
          user_id: string
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          performed_at?: string
          procedure_type: string
          supervisor_id?: string | null
          supervisor_validated?: boolean
          track: string
          user_id: string
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          performed_at?: string
          procedure_type?: string
          supervisor_id?: string | null
          supervisor_validated?: boolean
          track?: string
          user_id?: string
          validated_at?: string | null
        }
        Relationships: []
      }
      measurements: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          id: string
          measured_at: string
          measurement_type: string
          site: string | null
          unit: string
          value: number
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          id?: string
          measured_at?: string
          measurement_type: string
          site?: string | null
          unit: string
          value: number
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          id?: string
          measured_at?: string
          measurement_type?: string
          site?: string | null
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "measurements_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          id: string
          module_type: string
          sort_order: number
          title: string
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          id?: string
          module_type?: string
          sort_order?: number
          title: string
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          id?: string
          module_type?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      outcomes: {
        Row: {
          case_id: string
          created_at: string
          created_by: string
          details: Json | null
          id: string
          institution_id: string | null
          outcome_date: string
          outcome_type: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by: string
          details?: Json | null
          id?: string
          institution_id?: string | null
          outcome_date?: string
          outcome_type: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string
          details?: Json | null
          id?: string
          institution_id?: string | null
          outcome_date?: string
          outcome_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcomes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age_range: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          institution_id: string | null
          pseudonym: string
          risk_factors: Json | null
          sex: string | null
          updated_at: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          institution_id?: string | null
          pseudonym: string
          risk_factors?: Json | null
          sex?: string | null
          updated_at?: string
        }
        Update: {
          age_range?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          institution_id?: string | null
          pseudonym?: string
          risk_factors?: Json | null
          sex?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          institution: string | null
          onboarding_completed: boolean
          role: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          institution?: string | null
          onboarding_completed?: boolean
          role?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          institution?: string | null
          onboarding_completed?: boolean
          role?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proms: {
        Row: {
          case_id: string
          completed_at: string
          created_at: string
          id: string
          questionnaire_type: string
          responses: Json | null
          score: number | null
        }
        Insert: {
          case_id: string
          completed_at?: string
          created_at?: string
          id?: string
          questionnaire_type: string
          responses?: Json | null
          score?: number | null
        }
        Update: {
          case_id?: string
          completed_at?: string
          created_at?: string
          id?: string
          questionnaire_type?: string
          responses?: Json | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proms_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          completed_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          module_id: string
          passing_score: number
          questions: Json
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          passing_score?: number
          questions?: Json
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          passing_score?: number
          questions?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          points: number
          reference_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          points?: number
          reference_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          points?: number
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rgpd_requests: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          handled_at: string | null
          handled_by: string | null
          id: string
          request_type: string
          response: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          request_type: string
          response?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          request_type?: string
          response?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rubrics: {
        Row: {
          created_at: string
          criteria: string
          id: string
          max_score: number
          simulation_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          criteria: string
          id?: string
          max_score?: number
          simulation_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          criteria?: string
          id?: string
          max_score?: number
          simulation_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "rubrics_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          decisions: Json | null
          duration_seconds: number | null
          feedback: Json | null
          id: string
          score: number | null
          simulation_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          decisions?: Json | null
          duration_seconds?: number | null
          feedback?: Json | null
          id?: string
          score?: number | null
          simulation_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          decisions?: Json | null
          duration_seconds?: number | null
          feedback?: Json | null
          id?: string
          score?: number | null
          simulation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_runs_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          difficulty: string
          id: string
          is_published: boolean
          scenario: Json
          time_limit_seconds: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string
          id?: string
          is_published?: boolean
          scenario?: Json
          time_limit_seconds?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string
          id?: string
          is_published?: boolean
          scenario?: Json
          time_limit_seconds?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          payload?: Json | null
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string
        }
        Relationships: []
      }
      studies: {
        Row: {
          created_at: string
          created_by: string
          data_points: Json | null
          description: string | null
          eligibility_criteria: Json | null
          id: string
          institution_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          data_points?: Json | null
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          institution_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data_points?: Json | null
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          institution_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studies_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_members: {
        Row: {
          created_at: string
          id: string
          role: string
          study_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          study_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          study_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_members_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          product_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      validations: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          status: string
          track: string
          updated_at: string
          user_id: string
          validation_type: string
          validator_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          track: string
          updated_at?: string
          user_id: string
          validation_type: string
          validator_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          track?: string
          updated_at?: string
          user_id?: string
          validation_type?: string
          validator_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      governance_anomalies: {
        Row: {
          actor_id: string | null
          anomaly_type: string | null
          day: string | null
          error_count: number | null
          export_count: number | null
          last_event_at: string | null
          phi_access_count: number | null
          severity: string | null
          signoff_count: number | null
          total_events: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      compliance_score: { Args: never; Returns: Json }
      count_pending_signoffs: { Args: { _user_id: string }; Returns: number }
      enforce_data_lifecycle: { Args: never; Returns: Json }
      freeze_user_account: {
        Args: { _reason: string; _target_user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_users_with_activity: {
        Args: never
        Returns: {
          display_name: string
          events_30d: number
          last_activity_at: string
          patients_count: number
          pending_signoffs: number
          profile_role: string
          role_app: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      log_governance_event: {
        Args: {
          _action: string
          _category: string
          _context?: Json
          _institution_id?: string
          _severity?: string
          _target_entity_id?: string
          _target_entity_type?: string
          _target_user?: string
        }
        Returns: string
      }
      revoke_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: undefined
      }
      sign_with_eidas: {
        Args: { _content: string; _signoff_id: string }
        Returns: Json
      }
      system_health_metrics: { Args: never; Returns: Json }
      user_institution_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role:
        | "admin"
        | "physician"
        | "trainee"
        | "expert_reviewer"
        | "hospital_admin"
        | "research_lead"
        | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "physician",
        "trainee",
        "expert_reviewer",
        "hospital_admin",
        "research_lead",
        "super_admin",
      ],
    },
  },
} as const
