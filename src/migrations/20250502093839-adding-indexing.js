module.exports = {
  up: async (queryInterface) => {
    // Existing indexes
    await queryInterface.addIndex('students', ['batch_id', 'status', 'name'], {
      name: 'idx_student_batch_status_name',
    });
    await queryInterface.addIndex('Batches', ['Session_id', 'id'], {
      name: 'idx_batches_session_id',
    });
    await queryInterface.addIndex('Sessions', ['is_default', 'session_year'], {
      name: 'idx_session_default_year',
    });
    await queryInterface.addIndex('students', ['name'], {
      name: 'idx_student_name',
    });

    // Add pg_trgm extension and trigram GIN index
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    await queryInterface.sequelize.query(
      'CREATE INDEX idx_student_name_trgm ON students USING GIN (name gin_trgm_ops)'
    );
  },
  down: async (queryInterface) => {
    // Remove existing indexes
    await queryInterface.removeIndex('students', 'idx_student_batch_status_name');
    await queryInterface.removeIndex('Batches', 'idx_batches_session_id');
    await queryInterface.removeIndex('Sessions', 'idx_session_default_year');
    await queryInterface.removeIndex('students', 'idx_student_name');

    // Remove trigram index
    await queryInterface.sequelize.query('DROP INDEX idx_student_name_trgm');
    // Note: Do not drop pg_trgm extension, as other tables might use it
  },
};