class DropPasswordResetTokensTable < ActiveRecord::Migration[7.1]
  def change
    drop_table :password_reset_tokens
  end
end
