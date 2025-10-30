import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Vault.css';

interface Asset {
  id: string;
  filename: string;
  mime: string;
  size: number;
  status: string;
  created_at: string;
  storage_path: string;
}

const Vault: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadAssets();
  }, [user, navigate]);

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      // Create file path
      const fileName = file.name;
      const fileExt = fileName.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Create asset record
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .insert({
          owner_id: user.id,
          filename: fileName,
          mime: file.type,
          size: file.size,
          storage_path: filePath,
          status: 'uploading',
        })
        .select()
        .single();

      if (assetError) throw assetError;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('private-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update asset status to ready
      await supabase
        .from('assets')
        .update({ status: 'ready' })
        .eq('id', asset.id);

      // Reload assets
      await loadAssets();
      alert('File uploaded successfully!');

    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const { data, error } = await supabase.storage
        .from('private-assets')
        .createSignedUrl(asset.storage_path, 90); // 90 seconds expiry

      if (error) throw error;

      // Create temporary link for download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = asset.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      alert('Download failed: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="vault-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="vault-container">
      {/* Header */}
      <header className="vault-header">
        <div className="header-content">
          <h1 className="header-title">Secure Media Vault</h1>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="vault-main">
        {/* Upload Section */}
        <div className="upload-section">
          <label className="upload-label">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="upload-input"
            />
            <div className="upload-area">
              {uploading ? 'Uploading...' : 'Choose File to Upload'}
            </div>
          </label>
        </div>

        {/* Assets Grid */}
        <div className="assets-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="asset-card">
              <div className="asset-header">
                <h3 className="asset-filename">{asset.filename}</h3>
                <span className={`asset-status asset-status-${asset.status}`}>
                  {asset.status}
                </span>
              </div>
              
              <div className="asset-details">
                <p className="asset-size">{(asset.size / 1024).toFixed(1)} KB</p>
                <p className="asset-date">
                  {new Date(asset.created_at).toLocaleDateString()}
                </p>
              </div>

              {asset.status === 'ready' && (
                <button
                  onClick={() => handleDownload(asset)}
                  className="download-button"
                >
                  Download
                </button>
              )}
            </div>
          ))}
        </div>

        {assets.length === 0 && (
          <div className="empty-state">
            <p className="empty-message">No files uploaded yet.</p>
            <p className="empty-submessage">Upload your first file to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Vault;