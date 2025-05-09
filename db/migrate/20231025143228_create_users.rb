# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid do |t|
      t.string :email, null: false
      t.string :username, null: false
      t.string :password_digest, null: false
      t.boolean :active, default: true
      t.timestamps
    end

    add_index :users, :username, unique: true
  end
end
