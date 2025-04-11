# frozen_string_literal: true

json.array! @matches.each do |match|
  json.date match.date
  json.id match.id
  json.users do
    json.array! match.users.reject { |user| user.id == @current_user&.id }.each do |user|
      json.id user.id
      json.username user.username
      json.email user.email
    end
  end
end

