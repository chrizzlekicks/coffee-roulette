# frozen_string_literal: true

class CreateUserMatches < ActiveRecord::Migration[7.1]
  def change
    create_table :user_matches, id: :uuid do |t|
      t.references :user, null: false, type: :uuid, foreign_key: true
      t.references :match, null: false, type: :uuid, foreign_key: true
      t.timestamps
    end
  end
end
