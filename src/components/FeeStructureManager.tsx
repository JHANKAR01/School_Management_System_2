import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

interface FeeHead {
  id: string;
  school_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface FeeStructure {
  id: string;
  class_id: string;
  fee_head_id: string;
  amount: number;
  academic_year: string;
}

const FeeStructureManager: React.FC<{ classId: string }> = ({ classId }) => {
  const { profile } = useAuth();
  const [newFeeHead, setNewFeeHead] = useState({ name: '', description: '' });
  const [feeStructures, setFeeStructures] = useState<Record<string, number>>({});

  const { data: feeHeads, isLoading } = useQuery({
    queryKey: ['feeHeads', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('fee_heads')
        .select('*')
        .eq('school_id', profile?.school_id)
        .eq('is_active', true);
      return (data || []) as FeeHead[];
    },
    enabled: !!profile?.school_id,
  });

  const createFeeHeadMutation = useMutation({
    mutationFn: async (data: typeof newFeeHead) => {
      const { data: result, error } = await supabase
        .from('fee_heads')
        .insert([
          {
            school_id: profile?.school_id,
            name: data.name,
            description: data.description,
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      setNewFeeHead({ name: '', description: '' });
    },
  });

  const createFeeStructureMutation = useMutation({
    mutationFn: async () => {
      const structures = Object.entries(feeStructures).map(([feeHeadId, amount]) => ({
        school_id: profile?.school_id,
        class_id: classId,
        fee_head_id: feeHeadId,
        amount,
        academic_year: new Date().getFullYear().toString(),
      }));

      const { error } = await supabase.from('fee_structures').insert(structures);
      if (error) throw error;
    },
    onSuccess: () => {
      setFeeStructures({});
    },
  });

  const handleCreateFeeHead = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFeeHeadMutation.mutateAsync(newFeeHead);
  };

  const handleSaveFeeStructure = async () => {
    await createFeeStructureMutation.mutateAsync();
  };

  if (isLoading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Heads</h3>
        <form onSubmit={handleCreateFeeHead} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={newFeeHead.name}
              onChange={(e) => setNewFeeHead({ ...newFeeHead, name: e.target.value })}
              placeholder="Fee head name (e.g., Tuition)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={newFeeHead.description}
              onChange={(e) => setNewFeeHead({ ...newFeeHead, description: e.target.value })}
              placeholder="Description"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={createFeeHeadMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Fee Head
          </button>
        </form>

        <div className="space-y-2">
          {feeHeads?.map((head) => (
            <div key={head.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{head.name}</p>
                <p className="text-sm text-gray-600">{head.description}</p>
              </div>
              <input
                type="number"
                placeholder="Amount"
                value={feeStructures[head.id] || ''}
                onChange={(e) =>
                  setFeeStructures({
                    ...feeStructures,
                    [head.id]: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {Object.keys(feeStructures).length > 0 && (
          <button
            onClick={handleSaveFeeStructure}
            disabled={createFeeStructureMutation.isPending}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            {createFeeStructureMutation.isPending ? 'Saving...' : 'Save Fee Structure'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FeeStructureManager;
