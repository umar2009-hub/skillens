const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

const pdfService = {
  extractPdfText: async (documentId, storagePath, accessToken) => {
    // Create a Supabase client authenticated as the current user to bypass Row Level Security 
    // for private buckets and tables, without needing a Service Role Key.
    const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    try {
      logger.info(`Starting extraction for document ${documentId}`);

      // 1. Update status to 'extracting'
      await userSupabase
        .from('documents')
        .update({
          status: 'extracting',
          processing_progress: 10,
          processing_stage: 'Downloading PDF'
        })
        .eq('id', documentId);

      // 2. Download from Supabase Storage
      const { data: fileData, error: downloadError } = await userSupabase.storage
        .from('documents')
        .download(storagePath);

      if (downloadError) {
        throw new Error(`Failed to download PDF from storage: ${downloadError.message}`);
      }

      // Convert Blob to Buffer for pdf-parse
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Update status before parsing
      await userSupabase
        .from('documents')
        .update({
          processing_stage: 'Parsing Text'
        })
        .eq('id', documentId);

      // 4. Parse PDF using pdf-parse v2 API
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      await parser.destroy();
      
      const extractedText = pdfData.text || '';
      const pageCount = pdfData.pages ? pdfData.pages.length : (pdfData.numpages || 1);
      
      // Calculate Stats
      const words = extractedText.trim().split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      const characterCount = extractedText.length;
      
      // Average reading speed is around 200-250 words per minute. Using 200 for estimation.
      const estimatedReadingTime = Math.ceil(wordCount / 200);
      
      // Simple language detection (mock/defaulting to English for this hackathon version)
      // A robust app would use 'franc' or 'cld' here
      const language = 'English'; 

      // 5. Update Database with Extracted Data
      const { data: updatedDoc, error: updateError } = await userSupabase
        .from('documents')
        .update({
          extracted_text: extractedText,
          page_count: pageCount,
          word_count: wordCount,
          character_count: characterCount,
          estimated_reading_time: estimatedReadingTime,
          language: language,
          status: 'text_extracted',
          processing_progress: 20,
          processing_stage: 'Text Extracted'
        })
        .eq('id', documentId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update document in database: ${updateError.message}`);
      }

      logger.info(`Extraction complete for document ${documentId}`);

      return {
        documentId: updatedDoc.id,
        pageCount: updatedDoc.page_count,
        wordCount: updatedDoc.word_count,
        characterCount: updatedDoc.character_count,
        estimatedReadingTime: updatedDoc.estimated_reading_time,
        language: updatedDoc.language,
        status: updatedDoc.status,
        extractedText: updatedDoc.extracted_text
      };

    } catch (error) {
      logger.error(`Extraction failed for ${documentId}:`, error);

      // Attempt to mark as failed
      await userSupabase
        .from('documents')
        .update({
          status: 'failed',
          processing_stage: 'Extraction Failed'
        })
        .eq('id', documentId);

      throw error;
    }
  }
};

module.exports = pdfService;
