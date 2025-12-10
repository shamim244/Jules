'use client';

import React, { useState } from 'react';
import { useTokenManagement } from '../hooks/useTokenManagement';

export const TokenManagement = () => {
  const { revokeAuthority, updateMetadata, addCreator, loading, status, error } = useTokenManagement();
  const [activeTab, setActiveTab] = useState<'revoke' | 'update' | 'creator'>('revoke');

  // Revoke State
  const [revokeMintAddress, setRevokeMintAddress] = useState('');
  const [revokeType, setRevokeType] = useState<'Mint' | 'Freeze'>('Mint');

  // Update State
  const [updateMintAddress, setUpdateMintAddress] = useState('');
  const [updateData, setUpdateData] = useState({
    name: '',
    symbol: '',
    description: '',
    website: ''
  });
  const [updateImage, setUpdateImage] = useState<File | null>(null);

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeMintAddress) return;
    const success = await revokeAuthority(revokeMintAddress, revokeType);
    if (success) {
      alert(`${revokeType} Authority Revoked Successfully!`);
      setRevokeMintAddress('');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMintAddress) return;
    // Basic validation
    if (!updateData.name && !updateData.symbol && !updateData.description && !updateImage) {
      alert("Please provide at least one field to update");
      return;
    }

    const success = await updateMetadata(updateMintAddress, {
      ...updateData,
      image: updateImage || undefined
    });

    if (success) {
      alert("Metadata Updated Successfully!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl mt-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Token</h2>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'revoke' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('revoke')}
        >
          Revoke Authority
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'update' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('update')}
        >
          Update Metadata
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'creator' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('creator')}
        >
          Add Creator
        </button>
      </div>

      {activeTab === 'revoke' && (
        <form onSubmit={handleRevoke} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mint Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={revokeMintAddress}
              onChange={(e) => setRevokeMintAddress(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Authority Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={revokeType}
              onChange={(e) => setRevokeType(e.target.value as 'Mint' | 'Freeze')}
            >
              <option value="Mint">Mint Authority</option>
              <option value="Freeze">Freeze Authority</option>
            </select>
            <p className="text-xs text-red-500 mt-1">Warning: This action is irreversible.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? status || 'Processing...' : `Revoke ${revokeType} Authority (0.01 SOL)`}
          </button>
        </form>
      )}

      {activeTab === 'creator' && (
        <CreatorForm addCreator={addCreator} loading={loading} status={status} />
      )}

      {activeTab === 'update' && (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mint Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={updateMintAddress}
              onChange={(e) => setUpdateMintAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={updateData.name}
                onChange={(e) => setUpdateData({...updateData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Symbol</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                value={updateData.symbol}
                onChange={(e) => setUpdateData({...updateData, symbol: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={updateData.description}
              onChange={(e) => setUpdateData({...updateData, description: e.target.value})}
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Image (Optional)</label>
            <input
              type="file"
              className="w-full text-sm text-gray-500"
              accept="image/*"
              onChange={(e) => setUpdateImage(e.target.files?.[0] || null)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? status || 'Processing...' : 'Update Metadata (0.01 SOL)'}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

// Sub-component for Creator Form
const CreatorForm = ({ addCreator, loading, status }: { addCreator: any, loading: boolean, status: string }) => {
  const [mint, setMint] = useState('');
  const [creator, setCreator] = useState('');
  const [share, setShare] = useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await addCreator(mint, creator, share)) {
      alert('Creator added successfully!');
      setMint('');
      setCreator('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mint Address</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Creator Address</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Creator Share (%)</label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={share}
          onChange={(e) => setShare(Number(e.target.value))}
          min={0}
          max={100}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Remaining share will be assigned to you.</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? status || 'Processing...' : 'Add Creator (0.01 SOL)'}
      </button>
    </form>
  );
};
