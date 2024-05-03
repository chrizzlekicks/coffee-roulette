class CreatePasswordResetTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :password_reset_tokens, id: :uuid do |t|
      t.string :token, index: { unique: true }, null: false
      t.datetime :expires_at, null: false, default: -> { 'NOW() + interval \'1 day\'' }
      t.references :user,  null: false, type: :uuid, foreign_key: true

      t.timestamps
    end
  end
end
