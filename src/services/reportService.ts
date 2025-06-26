import { supabase } from '../lib/supabase';
import { Report, ReportFile, ReportUpdate } from '../lib/supabase';

export interface SubmitReportData {
  referenceId: string;
  category?: string;
  encryptedReportData: string;
  files: File[];
}

export interface ReportVerificationResult {
  report: Report;
  updates: ReportUpdate[];
}

class ReportService {
  async submitReport(data: SubmitReportData): Promise<boolean> {
    try {
      // Insert the report into public schema
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert({
          reference_id: data.referenceId,
          category: data.category,
          encrypted_report_data: data.encryptedReportData,
          file_count: data.files.length,
          status: 'received'
        })
        .select()
        .single();

      if (reportError) {
        console.error('Error inserting report:', reportError);
        return false;
      }

      // Upload files if any
      if (data.files.length > 0) {
        const uploadSuccess = await this.uploadFiles(reportData.id, data.files);
        if (!uploadSuccess) {
          console.warn('Some files failed to upload, but report was created');
        }
      }

      // Add initial update
      try {
        await supabase
          .from('report_updates')
          .insert({
            report_id: reportData.id,
            status: 'received',
            message: 'تم استلام التقرير وبدء المراجعة الأولية'
          });
      } catch (updateError) {
        console.warn('Failed to add initial update, but report was created:', updateError);
      }

      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      return false;
    }
  }

  private async uploadFiles(reportId: string, files: File[]): Promise<boolean> {
    let allUploadsSuccessful = true;

    for (const file of files) {
      try {
        // Upload file to Supabase Storage
        const fileName = `${reportId}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          allUploadsSuccessful = false;
          continue;
        }

        // Insert file record into public schema
        const { error: fileRecordError } = await supabase
          .from('report_files')
          .insert({
            report_id: reportId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type
          });

        if (fileRecordError) {
          console.error('Error inserting file record:', fileRecordError);
          allUploadsSuccessful = false;
        }
      } catch (error) {
        console.error('Error processing file:', error);
        allUploadsSuccessful = false;
      }
    }

    return allUploadsSuccessful;
  }

  async verifyReport(referenceId: string): Promise<ReportVerificationResult | null> {
    try {
      // Get report by reference ID from public schema
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('reference_id', referenceId)
        .single();

      if (reportError || !reportData) {
        return null;
      }

      // Get report updates from public schema
      const { data: updatesData, error: updatesError } = await supabase
        .from('report_updates')
        .select('*')
        .eq('report_id', reportData.id)
        .order('created_at', { ascending: true });

      if (updatesError) {
        console.error('Error fetching updates:', updatesError);
        return { report: reportData, updates: [] };
      }

      return {
        report: reportData,
        updates: updatesData || []
      };
    } catch (error) {
      console.error('Error verifying report:', error);
      return null;
    }
  }
}

export const reportService = new ReportService();