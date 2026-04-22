import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const UsersManager = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/auth/users/${userId}`, { role: newRole })
      fetchUsers()
      alert(`User role updated to ${newRole}`)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      await api.delete(`/auth/users/${userId}`)
      fetchUsers()
      alert('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-primary/20 text-primary-fixed'
      case 'designer': return 'bg-secondary/20 text-secondary'
      default: return 'bg-tertiary/20 text-tertiary'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-black uppercase tracking-tighter">Users Manager</h1>
          <p className="text-on-surface-variant text-sm mt-1">Total Users: {users.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-headline font-black mt-2">{users.length}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Admins</p>
          <p className="text-3xl font-headline font-black mt-2 text-primary">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Designers</p>
          <p className="text-3xl font-headline font-black mt-2 text-secondary">{users.filter(u => u.role === 'designer').length}</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-5">
          <p className="text-on-surface-variant text-xs uppercase tracking-wider">Customers</p>
          <p className="text-3xl font-headline font-black mt-2 text-tertiary">{users.filter(u => u.role === 'user').length}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:border-primary"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Designer">Designer</option>
          <option value="User">Customer</option>
        </select>
      </div>

      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant/20">
              <tr>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">User</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Email</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Role</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Joined</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center text-on-primary font-bold">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <span className="font-bold">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">{formatDate(user.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewDetails(user)}
                        className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      
                      <div className="relative group">
                        <button className="p-2 hover:bg-secondary/20 rounded-lg transition-colors text-secondary">
                          <span className="material-symbols-outlined text-sm">manage_accounts</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-36 bg-surface-container-high rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <div className="p-1">
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => handleRoleChange(user._id, 'admin')}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/20 rounded-lg"
                              >
                                Make Admin
                              </button>
                            )}
                            {user.role !== 'designer' && (
                              <button 
                                onClick={() => handleRoleChange(user._id, 'designer')}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/20 rounded-lg"
                              >
                                Make Designer
                              </button>
                            )}
                            {user.role !== 'user' && (
                              <button 
                                onClick={() => handleRoleChange(user._id, 'user')}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-tertiary/20 rounded-lg"
                              >
                                Make Customer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 hover:bg-error/20 rounded-lg transition-colors text-error"
                        title="Delete User"
                        disabled={user.role === 'admin'}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">group_off</span>
            <p className="text-on-surface-variant">No users found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-surface-container-low rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-xl font-black uppercase">User Details</h2>
                <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center text-on-primary text-2xl font-bold">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      selectedUser.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <p className="font-headline font-bold text-lg">{selectedUser.name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">Email</p>
                    <p className="font-mono text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">User ID</p>
                    <p className="font-mono text-xs truncate">{selectedUser._id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider">Joined</p>
                    <p>{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UsersManager