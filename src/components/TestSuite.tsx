import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play, Database, Shield, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSecurity } from '../contexts/SecurityContext';
import { reportService } from '../services/reportService';
import { platformSettingsService } from '../services/platformSettings';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const TestSuite: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { encryptData, generateSecureId } = useSecurity();

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { name, status, message, details }];
      }
    });
  };

  const runDatabaseSchemaTests = async () => {
    // Test 1: Check if api schema exists and tables are accessible
    try {
      updateTest('schema-check', 'pending', 'Checking database schema...');
      
      // Try to access the reports table in api schema
      const { data: reports, error: reportsError } = await supabase
        .from('api.reports')  // Changed to use api schema
        .select('count')
        .limit(1);
      
      if (reportsError) {
        // If api schema fails, try public schema as fallback
        const { data: publicReports, error: publicError } = await supabase
          .from('reports')
          .select('count')
          .limit(1);
        
        if (publicError) {
          updateTest('schema-check', 'error', 'Neither api.reports nor reports table accessible', 
            `API Schema Error: ${reportsError.message}\nPublic Schema Error: ${publicError.message}`);
        } else {
          updateTest('schema-check', 'warning', 'Using public schema instead of api schema', 
            'Tables found in public schema, but migration expects api schema');
        }
      } else {
        updateTest('schema-check', 'success', 'API schema configured correctly');
      }
    } catch (error) {
      updateTest('schema-check', 'error', 'Schema check failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Check platform settings
    try {
      updateTest('platform-settings', 'pending', 'Testing platform settings...');
      
      const encryptionSettings = await platformSettingsService.getEncryptionSettings();
      const panicSettings = await platformSettingsService.getPanicButtonSettings();
      
      if (encryptionSettings && panicSettings) {
        updateTest('platform-settings', 'success', 'Platform settings loaded successfully');
      } else {
        updateTest('platform-settings', 'warning', 'Some platform settings missing');
      }
    } catch (error) {
      updateTest('platform-settings', 'error', 'Platform settings test failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runEncryptionTests = async () => {
    // Test 3: PGP Encryption
    try {
      updateTest('pgp-encryption', 'pending', 'Testing PGP encryption...');
      
      const testData = 'Test encryption data: ' + Date.now();
      const encrypted = await encryptData(testData);
      
      if (encrypted && encrypted !== testData) {
        if (encrypted.includes('-----BEGIN PGP MESSAGE-----')) {
          updateTest('pgp-encryption', 'success', 'PGP encryption working correctly');
        } else {
          updateTest('pgp-encryption', 'warning', 'Using AES fallback encryption', 'PGP encryption failed, but fallback is working');
        }
      } else {
        updateTest('pgp-encryption', 'error', 'Encryption failed completely');
      }
    } catch (error) {
      updateTest('pgp-encryption', 'error', 'Encryption test failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runRLSTests = async () => {
    // Test 4: Anonymous user permissions (INSERT) - Try both schemas
    try {
      updateTest('rls-insert', 'pending', 'Testing anonymous INSERT permissions...');
      
      const testReferenceId = generateSecureId();
      const testData = await encryptData('Test report data');
      
      // First try api schema
      let { data, error } = await supabase
        .from('api.reports')
        .insert({
          reference_id: testReferenceId,
          category: 'test',
          encrypted_report_data: testData,
          file_count: 0,
          status: 'received'
        })
        .select()
        .single();
      
      if (error) {
        // Fallback to public schema
        const result = await supabase
          .from('reports')
          .insert({
            reference_id: testReferenceId,
            category: 'test',
            encrypted_report_data: testData,
            file_count: 0,
            status: 'received'
          })
          .select()
          .single();
        
        if (result.error) {
          updateTest('rls-insert', 'error', 'Anonymous INSERT failed in both schemas', 
            `API Schema: ${error.message}\nPublic Schema: ${result.error.message}`);
        } else {
          updateTest('rls-insert', 'warning', 'INSERT working in public schema only', 
            'Consider migrating to api schema for consistency');
          data = result.data;
        }
      } else {
        updateTest('rls-insert', 'success', 'Anonymous INSERT working correctly in api schema');
      }
      
      // Clean up test data if successful
      if (data) {
        await supabase.from('api.reports').delete().eq('id', data.id);
        await supabase.from('reports').delete().eq('id', data.id);
      }
    } catch (error) {
      updateTest('rls-insert', 'error', 'RLS INSERT test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: Anonymous user permissions (SELECT)
    try {
      updateTest('rls-select', 'pending', 'Testing anonymous SELECT permissions...');
      
      // Try api schema first
      let { data, error } = await supabase
        .from('api.reports')
        .select('id, reference_id, status, created_at')
        .limit(1);
      
      if (error) {
        // Fallback to public schema
        const result = await supabase
          .from('reports')
          .select('id, reference_id, status, created_at')
          .limit(1);
        
        if (result.error) {
          updateTest('rls-select', 'error', 'Anonymous SELECT failed in both schemas', 
            `API Schema: ${error.message}\nPublic Schema: ${result.error.message}`);
        } else {
          updateTest('rls-select', 'warning', 'SELECT working in public schema only');
        }
      } else {
        updateTest('rls-select', 'success', 'Anonymous SELECT working correctly in api schema');
      }
    } catch (error) {
      updateTest('rls-select', 'error', 'RLS SELECT test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Platform settings access
    try {
      updateTest('rls-settings', 'pending', 'Testing platform settings access...');
      
      // Try api schema first
      let { data, error } = await supabase
        .from('api.platform_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'encryption')
        .single();
      
      if (error) {
        // Fallback to public schema
        const result = await supabase
          .from('platform_settings')
          .select('setting_key, setting_value')
          .eq('setting_key', 'encryption')
          .single();
        
        if (result.error) {
          updateTest('rls-settings', 'error', 'Platform settings access failed in both schemas', 
            `API Schema: ${error.message}\nPublic Schema: ${result.error.message}`);
        } else {
          updateTest('rls-settings', 'warning', 'Platform settings accessible in public schema only');
        }
      } else {
        updateTest('rls-settings', 'success', 'Platform settings accessible in api schema');
      }
    } catch (error) {
      updateTest('rls-settings', 'error', 'Platform settings test failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runReportServiceTests = async () => {
    // Test 7: Full report submission flow
    try {
      updateTest('report-submission', 'pending', 'Testing complete report submission...');
      
      const testReferenceId = generateSecureId();
      const testReportData = {
        referenceId: testReferenceId,
        category: 'test',
        encryptedReportData: await encryptData('Complete test report'),
        files: []
      };
      
      const success = await reportService.submitReport(testReportData);
      
      if (success) {
        updateTest('report-submission', 'success', 'Report submission working correctly');
        
        // Test verification
        const verification = await reportService.verifyReport(testReferenceId);
        if (verification) {
          updateTest('report-verification', 'success', 'Report verification working correctly');
        } else {
          updateTest('report-verification', 'warning', 'Report verification returned null');
        }
      } else {
        updateTest('report-submission', 'error', 'Report submission failed');
      }
    } catch (error) {
      updateTest('report-submission', 'error', 'Report submission test failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runStorageTests = async () => {
    // Test 8: Storage bucket access
    try {
      updateTest('storage-access', 'pending', 'Testing storage bucket access...');
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        updateTest('storage-access', 'warning', 'Storage access limited', error.message);
      } else {
        const reportFilesBucket = buckets?.find(bucket => bucket.name === 'report-files');
        if (reportFilesBucket) {
          updateTest('storage-access', 'success', 'Storage bucket accessible');
        } else {
          updateTest('storage-access', 'warning', 'report-files bucket not found', 'Create the bucket in Supabase dashboard');
        }
      }
    } catch (error) {
      updateTest('storage-access', 'error', 'Storage test failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runSchemaDetectionTest = async () => {
    // New test to detect which schema is being used
    try {
      updateTest('schema-detection', 'pending', 'Detecting active schema...');
      
      const apiSchemaWorks = await supabase.from('api.reports').select('count').limit(1).then(
        ({ error }) => !error
      );
      
      const publicSchemaWorks = await supabase.from('reports').select('count').limit(1).then(
        ({ error }) => !error
      );
      
      if (apiSchemaWorks && publicSchemaWorks) {
        updateTest('schema-detection', 'warning', 'Both schemas exist', 
          'Both public and api schemas have reports table. Consider consolidating.');
      } else if (apiSchemaWorks) {
        updateTest('schema-detection', 'success', 'Using api schema (recommended)');
      } else if (publicSchemaWorks) {
        updateTest('schema-detection', 'warning', 'Using public schema', 
          'Consider migrating to api schema for better organization');
      } else {
        updateTest('schema-detection', 'error', 'No schema detected', 
          'Neither api.reports nor reports table found');
      }
    } catch (error) {
      updateTest('schema-detection', 'error', 'Schema detection failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    try {
      await runSchemaDetectionTest(); // Run this first
      await runDatabaseSchemaTests();
      await runEncryptionTests();
      await runRLSTests();
      await runReportServiceTests();
      await runStorageTests();
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'pending':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Test Suite</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive testing of database schema, encryption, RLS policies, and application functionality
          </p>
        </div>

        {/* Test Summary */}
        {tests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        )}

        {/* Run Tests Button */}
        <div className="text-center mb-8">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto font-medium"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Run All Tests
              </>
            )}
          </button>
        </div>

        {/* Test Results */}
        {tests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Test Results</h2>
            
            {/* Schema Detection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Schema Detection</h3>
              </div>
              <div className="space-y-3">
                {tests.filter(t => ['schema-detection'].includes(t.name)).map((test, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(test.status)}
                        <span className="ml-3 font-medium">{test.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{test.message}</span>
                    </div>
                    {test.details && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {test.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Database Schema Tests */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Database Schema Tests</h3>
              </div>
              <div className="space-y-3">
                {tests.filter(t => ['schema-check', 'platform-settings'].includes(t.name)).map((test, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(test.status)}
                        <span className="ml-3 font-medium">{test.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{test.message}</span>
                    </div>
                    {test.details && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {test.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Encryption Tests */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Key className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Encryption Tests</h3>
              </div>
              <div className="space-y-3">
                {tests.filter(t => ['pgp-encryption'].includes(t.name)).map((test, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(test.status)}
                        <span className="ml-3 font-medium">{test.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{test.message}</span>
                    </div>
                    {test.details && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {test.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Security & RLS Tests */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Security & RLS Policy Tests</h3>
              </div>
              <div className="space-y-3">
                {tests.filter(t => ['rls-insert', 'rls-select', 'rls-settings'].includes(t.name)).map((test, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(test.status)}
                        <span className="ml-3 font-medium">{test.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{test.message}</span>
                    </div>
                    {test.details && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {test.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Application Tests */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Application Functionality Tests</h3>
              </div>
              <div className="space-y-3">
                {tests.filter(t => ['report-submission', 'report-verification', 'storage-access'].includes(t.name)).map((test, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(test.status)}
                        <span className="ml-3 font-medium">{test.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{test.message}</span>
                    </div>
                    {test.details && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {test.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Test Instructions & Troubleshooting</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Before running tests:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Run the database migration in Supabase SQL Editor</li>
              <li>Verify that the 'report-files' storage bucket exists</li>
              <li>Check that environment variables are properly configured</li>
            </ul>
            <p className="mt-4"><strong>Schema Issues:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>If tests show warnings about public schema, your app is using the old schema</li>
              <li>Run the provided migration to move tables to api schema</li>
              <li>Update your service files to use api.table_name format</li>
            </ul>
            <p className="mt-4"><strong>Common Fixes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Permission denied:</strong> Run the migration with proper GRANT statements</li>
              <li><strong>PGP encryption failed:</strong> Check if the public key is valid</li>
              <li><strong>Schema detection warnings:</strong> Consolidate to single schema (api recommended)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};